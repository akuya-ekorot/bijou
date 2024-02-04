import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/[shopSlug]/collections/useOptimisticCollections";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  type Collection,
  insertCollectionParams,
} from "@/lib/db/schema/collections";
import {
  createCollectionAction,
  deleteCollectionAction,
  updateCollectionAction,
} from "@/lib/actions/collections";
import { getShopBySlug } from "@/lib/api/shops/queries";
import { upload } from "@/lib/api/upload";
import { insertMultipleImagesParams } from "@/lib/db/schema/images";
import { createImageAction } from "@/lib/actions/images";
import { createCollectionImageAction } from "@/lib/actions/collectionImages";

const CollectionForm = ({
  collection,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  collection?: Collection | null;

  openModal?: (collection?: Collection) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } = useValidatedForm<
    Collection & { images: FileList | null }
  >(insertCollectionParams);
  const { toast } = useToast();
  const editing = !!collection?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();
  const params = useParams();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Collection },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
    } else {
      router.refresh();
      postSuccess && postSuccess();
    }

    toast({
      title: failed ? `Failed to ${action}` : "Success",
      description: failed ? data?.error ?? "Error" : `Collection ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (
    { images }: { images: FileList | null },
    data: FormData,
  ) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const imageIds: Array<{ id: string }> = [];

    //TODO: upload image if not null
    if (images) {
      const { data: uploadData, error: uploadError } = await upload(images);

      if (uploadError || !uploadData) {
        setErrors({ images: [uploadError ?? "error uploading images"] });
        return;
      }

      const imageParsed = await insertMultipleImagesParams.safeParseAsync(
        uploadData.urls,
      );

      if (!imageParsed.success) {
        console.log(imageParsed.error);
        setErrors({ images: ["Error parsing image data"] });
        return;
      }

      for (const parsedImage of imageParsed.data) {
        const { error, image } = await createImageAction(parsedImage);

        if (error || !image) {
          setErrors({ images: [error ?? "Error creating image records"] });
          return;
        }

        imageIds.push({ id: image.image.id });
      }
    }

    //TODO: create collection record
    const { shop } = await getShopBySlug(params.shopSlug as string);

    const collectionParsed = await insertCollectionParams.safeParseAsync({
      ...payload,
      shopId: shop.id,
    });

    if (!collectionParsed.success) {
      setErrors(collectionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = collectionParsed.data;
    const pendingImages = imageIds.map((image) => ({
      ...image,
      url: "",
      userId: collection?.userId ?? "",
      updatedAt: collection?.updatedAt ?? new Date(),
      createdAt: collection?.createdAt ?? new Date(),
    }));

    const pendingCollection: Collection = {
      updatedAt: collection?.updatedAt ?? new Date(),
      createdAt: collection?.createdAt ?? new Date(),
      id: collection?.id ?? "",
      userId: collection?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: { ...pendingCollection, images: pendingImages },
            action: editing ? "update" : "create",
          });

        const { error, collection: newCollection } = editing
          ? await updateCollectionAction({ ...values, id: collection.id })
          : await createCollectionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingCollection,
        };

        if (error || !newCollection) {
          onSuccess(
            editing ? "update" : "create",
            error ? errorFormatted : undefined,
          );
          return;
        }

        let order = 0;

        //TODO: create collection image record
        for (const imageId of imageIds) {
          const imageError = await createCollectionImageAction({
            collectionId: newCollection.collection.id,
            imageId: imageId.id,
            order,
          });

          if (imageError) {
            setErrors({ images: [imageError] });
            return;
          }

          order++;
        }

        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  const [images, setImages] = useState<FileList | null>(null);

  const handleSubmitWrapper = handleSubmit.bind(null, { images });

  return (
    <form
      action={handleSubmitWrapper}
      onChange={handleChange}
      className={"space-y-8"}
    >
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={collection?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : "",
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={collection?.description ?? ""}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.images ? "text-destructive" : "",
          )}
        >
          Images
        </Label>
        <Input
          type="file"
          multiple
          name="images"
          className={cn(errors?.images ? "ring ring-destructive" : "")}
          onChange={(e) => {
            setImages(e.target.files);
          }}
        />
        {errors?.images ? (
          <p className="text-xs text-destructive mt-2">{errors.images[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic &&
                addOptimistic({
                  action: "delete",
                  data: { ...collection, images: [] },
                });
              const error = await deleteCollectionAction(collection.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: collection,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/collections");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default CollectionForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};

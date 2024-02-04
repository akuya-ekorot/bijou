import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/[shopSlug]/images/useOptimisticImages";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  type TImage,
  insertImageParams,
  insertMultipleImagesParams,
} from "@/lib/db/schema/images";
import {
  createImageAction,
  deleteImageAction,
  updateImageAction,
} from "@/lib/actions/images";
import { supabase } from "@/lib/supabase/client";
import { upload } from "@/lib/api/upload";

const ImageForm = ({
  image,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  image?: TImage | null;

  openModal?: (image?: TImage) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<TImage>(insertImageParams);

  const { toast } = useToast();
  const editing = !!image?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: TImage },
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
      description: failed ? data?.error ?? "Error" : `Image ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (
    { images }: { images: FileList | null },
    data: FormData,
  ) => {
    setErrors(null);

    if (!images) {
      setErrors({ url: ["Image is required"] });
      return;
    }

    // upload images
    const { data: uploadData, error: uploadError } = await upload(images);

    if (uploadError || !uploadData) {
      setErrors({ url: [uploadError ?? "error uploading images"] });
      return;
    }

    const imageParsed = await insertMultipleImagesParams.safeParseAsync(
      uploadData.urls,
    );

    if (!imageParsed.success) {
      console.log(imageParsed.error);
      setErrors({ url: ["Error parsing image data"] });
      return;
    }

    closeModal && closeModal();

    for (const parsedImage of imageParsed.data) {
      const values = parsedImage;

      const pendingImage: TImage = {
        updatedAt: image?.updatedAt ?? new Date(),
        createdAt: image?.createdAt ?? new Date(),
        id: image?.id ?? "",
        userId: image?.userId ?? "",
        ...values,
      };

      try {
        startMutation(async () => {
          addOptimistic &&
            addOptimistic({
              data: pendingImage,
              action: editing ? "update" : "create",
            });

          const { error } = editing
            ? await updateImageAction({ ...values, id: image.id })
            : await createImageAction(values);

          const errorFormatted = {
            error: error ?? "Error",
            values: pendingImage,
          };
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
            errors?.url ? "text-destructive" : "",
          )}
        >
          Url
        </Label>
        <Input
          type="file"
          multiple
          name="url"
          className={cn(errors?.url ? "ring ring-destructive" : "")}
          defaultValue={image?.url ?? ""}
          onChange={(e) => {
            setImages(e.target.files);
          }}
        />
        {errors?.url ? (
          <p className="text-xs text-destructive mt-2">{errors.url[0]}</p>
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
              addOptimistic && addOptimistic({ action: "delete", data: image });
              const error = await deleteImageAction(image.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: image,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/images");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ImageForm;

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

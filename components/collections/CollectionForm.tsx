import { z } from "zod";

import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { type TAddOptimistic } from "@/app/[shopSlug]/collections/useOptimisticCollections";
import { cn, type Action } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createCollectionAction,
  deleteCollectionAction,
  updateCollectionAction,
} from "@/lib/actions/collections";
import {
  insertCollectionParams,
  type Collection,
} from "@/lib/db/schema/collections";
import { type Shop } from "@/lib/db/schema/shops";

const CollectionForm = ({
  shop,
  collection,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  collection?: Collection | null;
  shop: Shop;
  openModal?: (collection?: Collection) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Collection>(insertCollectionParams);
  const { toast } = useToast();
  const editing = !!collection?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

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

  const handleSubmit = async (shopId: string, data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const collectionParsed = await insertCollectionParams.safeParseAsync({
      ...payload,
      shopId,
    });
    if (!collectionParsed.success) {
      setErrors(collectionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = collectionParsed.data;
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
            data: pendingCollection,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateCollectionAction({ ...values, id: collection.id })
          : await createCollectionAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingCollection,
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
  };

  const handleSubmitWithShopId = handleSubmit.bind(null, shop.id);

  return (
    <form
      action={handleSubmitWithShopId}
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
            errors?.slug ? "text-destructive" : "",
          )}
        >
          Slug
        </Label>
        <Input
          type="text"
          name="slug"
          className={cn(errors?.slug ? "ring ring-destructive" : "")}
          defaultValue={collection?.slug ?? ""}
        />
        {errors?.slug ? (
          <p className="text-xs text-destructive mt-2">{errors.slug[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.coverImage ? "text-destructive" : "",
          )}
        >
          Cover Image
        </Label>
        <Input
          type="text"
          name="coverImage"
          className={cn(errors?.coverImage ? "ring ring-destructive" : "")}
          defaultValue={collection?.coverImage ?? ""}
        />
        {errors?.coverImage ? (
          <p className="text-xs text-destructive mt-2">
            {errors.coverImage[0]}
          </p>
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
                addOptimistic({ action: "delete", data: collection });
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
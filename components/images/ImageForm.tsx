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

import { type Image, insertImageParams } from "@/lib/db/schema/images";
import {
  createImageAction,
  deleteImageAction,
  updateImageAction,
} from "@/lib/actions/images";
import { supabase } from "@/lib/supabase/client";

const ImageForm = ({
  image,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  image?: Image | null;

  openModal?: (image?: Image) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Image>(insertImageParams);

  const { toast } = useToast();
  const editing = !!image?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Image },
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

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());

    // upload image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(`public/images/${Date.now()}`, payload.url);

    if (uploadError) {
      setErrors({ url: [uploadError.message] });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(uploadData.path);

    const imageParsed = await insertImageParams.safeParseAsync({
      url: publicUrl,
    });

    if (!imageParsed.success) {
      setErrors(imageParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = imageParsed.data;
    const pendingImage: Image = {
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

        const error = editing
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
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
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
          name="url"
          className={cn(errors?.url ? "ring ring-destructive" : "")}
          defaultValue={image?.url ?? ""}
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

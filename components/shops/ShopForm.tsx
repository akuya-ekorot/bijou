import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/shops/useOptimisticShops";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { type Shop, insertShopParams } from "@/lib/db/schema/shops";
import {
  createShopAction,
  deleteShopAction,
  updateShopAction,
} from "@/lib/actions/shops";

const ShopForm = ({
  shop,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  shop?: Shop | null;

  openModal?: (shop?: Shop) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Shop>(insertShopParams);
  const { toast } = useToast();
  const editing = !!shop?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Shop },
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
      description: failed ? data?.error ?? "Error" : `Shop ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const shopParsed = await insertShopParams.safeParseAsync(payload);
    if (!shopParsed.success) {
      setErrors(shopParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = shopParsed.data;
    const pendingShop: Shop = {
      updatedAt: shop?.updatedAt ?? new Date(),
      createdAt: shop?.createdAt ?? new Date(),
      id: shop?.id ?? "",
      userId: shop?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingShop,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateShopAction({ ...values, id: shop.id })
          : await createShopAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingShop,
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
    <form action={handleSubmit} onChange={handleChange} className={"space-y-4"}>
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
          defaultValue={shop?.name ?? ""}
        />
        {errors?.name && (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
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
          defaultValue={shop?.slug ?? ""}
        />
        {errors?.slug && (
          <p className="text-xs text-destructive mt-2">{errors.slug[0]}</p>
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.logoUrl ? "text-destructive" : "",
          )}
        >
          Logo Url
        </Label>
        <Input
          type="text"
          name="logoUrl"
          className={cn(errors?.logoUrl ? "ring ring-destructive" : "")}
          defaultValue={shop?.logoUrl ?? ""}
        />
        {errors?.logoUrl && (
          <p className="text-xs text-destructive mt-2">{errors.logoUrl[0]}</p>
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
              addOptimistic && addOptimistic({ action: "delete", data: shop });
              const error = await deleteShopAction(shop.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: shop,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/shops");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ShopForm;

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

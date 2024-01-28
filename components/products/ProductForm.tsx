import { z } from "zod";

import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { cn, type Action } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { TAddOptimistic } from "@/app/[shopSlug]/products/useOptimisticProducts";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import { insertProductParams, type Product } from "@/lib/db/schema/products";
import { type Shop } from "@/lib/db/schema/shops";

const ProductForm = ({
  shop,
  product,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  product?: Product | null;
  shop: Shop;
  openModal?: (product?: Product) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Product>(insertProductParams);
  const { toast } = useToast();
  const editing = !!product?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Product },
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
      description: failed ? data?.error ?? "Error" : `Product ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (shopId: string, data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const productParsed = await insertProductParams.safeParseAsync({
      ...payload,
      shopId,
    });
    if (!productParsed.success) {
      setErrors(productParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = productParsed.data;

    const pendingProduct: Product = {
      updatedAt: product?.updatedAt ?? new Date(),
      createdAt: product?.createdAt ?? new Date(),
      id: product?.id ?? "",
      userId: product?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingProduct,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateProductAction({ ...values, id: product.id })
          : await createProductAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingProduct,
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
          defaultValue={product?.name ?? ""}
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
            errors?.slug ? "text-destructive" : "",
          )}
        >
          Slug
        </Label>
        <Input
          type="text"
          name="slug"
          className={cn(errors?.slug ? "ring ring-destructive" : "")}
          defaultValue={product?.slug ?? ""}
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
            errors?.description ? "text-destructive" : "",
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={product?.description ?? ""}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
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
                addOptimistic({ action: "delete", data: product });
              const error = await deleteProductAction(product.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: product,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/products");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ProductForm;

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

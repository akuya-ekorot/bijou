import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/[shopSlug]/order-items/useOptimisticOrderItems";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  type OrderItem,
  insertOrderItemParams,
} from "@/lib/db/schema/orderItems";
import {
  createOrderItemAction,
  deleteOrderItemAction,
  updateOrderItemAction,
} from "@/lib/actions/orderItems";
import { type Order } from "@/lib/db/schema/orders";
import { type Product } from "@/lib/db/schema/products";
import { type Shop } from "@/lib/db/schema/shops";

const OrderItemForm = ({
  orders,
  products,
  shops,
  orderItem,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  orderItem?: OrderItem | null;
  orders: Order[];
  products: Product[];
  shops: Shop[];
  openModal?: (orderItem?: OrderItem) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<OrderItem>(insertOrderItemParams);
  const { toast } = useToast();
  const editing = !!orderItem?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: OrderItem },
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
      description: failed ? data?.error ?? "Error" : `OrderItem ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const orderItemParsed = await insertOrderItemParams.safeParseAsync(payload);
    if (!orderItemParsed.success) {
      setErrors(orderItemParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = orderItemParsed.data;
    const pendingOrderItem: OrderItem = {
      updatedAt: orderItem?.updatedAt ?? new Date(),
      createdAt: orderItem?.createdAt ?? new Date(),
      id: orderItem?.id ?? "",
      userId: orderItem?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingOrderItem,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updateOrderItemAction({ ...values, id: orderItem.id })
          : await createOrderItemAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingOrderItem,
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
            errors?.orderId ? "text-destructive" : "",
          )}
        >
          Order
        </Label>
        <Select defaultValue={orderItem?.orderId} name="orderId">
          <SelectTrigger
            className={cn(errors?.orderId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a order" />
          </SelectTrigger>
          <SelectContent>
            {orders?.map((order) => (
              <SelectItem key={order.id} value={order.id.toString()}>
                {order.id}
                {/* TODO: Replace with a field from the order model */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.orderId ? (
          <p className="text-xs text-destructive mt-2">{errors.orderId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.productId ? "text-destructive" : "",
          )}
        >
          Product
        </Label>
        <Select defaultValue={orderItem?.productId} name="productId">
          <SelectTrigger
            className={cn(errors?.productId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.id}
                {/* TODO: Replace with a field from the product model */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.productId ? (
          <p className="text-xs text-destructive mt-2">{errors.productId[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.shopId ? "text-destructive" : "",
          )}
        >
          Shop
        </Label>
        <Select defaultValue={orderItem?.shopId} name="shopId">
          <SelectTrigger
            className={cn(errors?.shopId ? "ring ring-destructive" : "")}
          >
            <SelectValue placeholder="Select a shop" />
          </SelectTrigger>
          <SelectContent>
            {shops?.map((shop) => (
              <SelectItem key={shop.id} value={shop.id.toString()}>
                {shop.id}
                {/* TODO: Replace with a field from the shop model */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.shopId ? (
          <p className="text-xs text-destructive mt-2">{errors.shopId[0]}</p>
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
                addOptimistic({ action: "delete", data: orderItem });
              const error = await deleteOrderItemAction(orderItem.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: orderItem,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/order-items");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default OrderItemForm;

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

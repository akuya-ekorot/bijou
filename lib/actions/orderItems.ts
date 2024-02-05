"use server";

import { revalidatePath } from "next/cache";
import {
  createOrderItem,
  deleteOrderItem,
  updateOrderItem,
} from "@/lib/api/orderItems/mutations";
import {
  OrderItemId,
  NewOrderItemParams,
  UpdateOrderItemParams,
  orderItemIdSchema,
  insertOrderItemParams,
  updateOrderItemParams,
} from "@/lib/db/schema/orderItems";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateOrderItems = () => revalidatePath("/order-items");

export const createOrderItemAction = async (input: NewOrderItemParams) => {
  try {
    const payload = insertOrderItemParams.parse(input);
    await createOrderItem(payload);
    revalidateOrderItems();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateOrderItemAction = async (input: UpdateOrderItemParams) => {
  try {
    const payload = updateOrderItemParams.parse(input);
    await updateOrderItem(payload.id, payload);
    revalidateOrderItems();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteOrderItemAction = async (input: OrderItemId) => {
  try {
    const payload = orderItemIdSchema.parse({ id: input });
    await deleteOrderItem(payload.id);
    revalidateOrderItems();
  } catch (e) {
    return handleErrors(e);
  }
};
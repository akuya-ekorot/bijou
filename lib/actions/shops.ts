"use server";

import { revalidatePath } from "next/cache";
import { createShop, deleteShop, updateShop } from "@/lib/api/shops/mutations";
import {
  ShopId,
  NewShopParams,
  UpdateShopParams,
  shopIdSchema,
  insertShopParams,
  updateShopParams,
} from "@/lib/db/schema/shops";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateShops = () => revalidatePath("/shops");

export const createShopAction = async (input: NewShopParams) => {
  try {
    const payload = insertShopParams.parse(input);
    await createShop(payload);
    revalidateShops();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateShopAction = async (input: UpdateShopParams) => {
  try {
    const payload = updateShopParams.parse(input);
    await updateShop(payload.id, payload);
    revalidateShops();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteShopAction = async (input: ShopId) => {
  try {
    const payload = shopIdSchema.parse({ id: input });
    await deleteShop(payload.id);
    revalidateShops();
  } catch (e) {
    return handleErrors(e);
  }
};


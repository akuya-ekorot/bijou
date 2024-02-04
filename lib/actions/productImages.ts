"use server";

import { revalidatePath } from "next/cache";
import {
  createProductImage,
  deleteProductImage,
  updateProductImage,
} from "@/lib/api/productImages/mutations";
import {
  ProductImageId,
  NewProductImageParams,
  UpdateProductImageParams,
  productImageIdSchema,
  insertProductImageParams,
  updateProductImageParams,
} from "@/lib/db/schema/productImages";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateProductImages = () => revalidatePath("/product-images");

export const createProductImageAction = async (input: NewProductImageParams) => {
  try {
    const payload = insertProductImageParams.parse(input);
    await createProductImage(payload);
    revalidateProductImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateProductImageAction = async (input: UpdateProductImageParams) => {
  try {
    const payload = updateProductImageParams.parse(input);
    await updateProductImage(payload.id, payload);
    revalidateProductImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteProductImageAction = async (input: ProductImageId) => {
  try {
    const payload = productImageIdSchema.parse({ id: input });
    await deleteProductImage(payload.id);
    revalidateProductImages();
  } catch (e) {
    return handleErrors(e);
  }
};
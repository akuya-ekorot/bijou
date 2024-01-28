"use server";

import { revalidatePath } from "next/cache";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/api/products/mutations";
import {
  ProductId,
  NewProductParams,
  UpdateProductParams,
  productIdSchema,
  insertProductParams,
  updateProductParams,
} from "@/lib/db/schema/products";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateProducts = () => revalidatePath("/products");

export const createProductAction = async (input: NewProductParams) => {
  try {
    const payload = insertProductParams.parse(input);
    await createProduct(payload);
    revalidateProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateProductAction = async (input: UpdateProductParams) => {
  try {
    const payload = updateProductParams.parse(input);
    await updateProduct(payload.id, payload);
    revalidateProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteProductAction = async (input: ProductId) => {
  try {
    const payload = productIdSchema.parse({ id: input });
    await deleteProduct(payload.id);
    revalidateProducts();
  } catch (e) {
    return handleErrors(e);
  }
};
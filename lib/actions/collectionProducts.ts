"use server";

import {
  createCollectionProduct,
  deleteCollectionProduct,
  updateCollectionProduct,
} from "@/lib/api/collectionProducts/mutations";
import {
  CollectionProductId,
  NewCollectionProductParams,
  UpdateCollectionProductParams,
  collectionProductIdSchema,
  insertCollectionProductParams,
  updateCollectionProductParams,
} from "@/lib/db/schema/collectionProducts";
import { revalidatePath } from "next/cache";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCollectionProducts = () =>
  revalidatePath("/collection-products");

export const createCollectionProductAction = async (
  input: NewCollectionProductParams,
) => {
  try {
    const payload = insertCollectionProductParams.parse(input);
    await createCollectionProduct(payload);
    revalidateCollectionProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCollectionProductAction = async (
  input: UpdateCollectionProductParams,
) => {
  try {
    const payload = updateCollectionProductParams.parse(input);
    await updateCollectionProduct(payload.id, payload);
    revalidateCollectionProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCollectionProductAction = async (
  input: CollectionProductId,
) => {
  try {
    const payload = collectionProductIdSchema.parse({ id: input });
    await deleteCollectionProduct(payload.id);
    revalidateCollectionProducts();
  } catch (e) {
    return handleErrors(e);
  }
};


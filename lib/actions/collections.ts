"use server";

import { revalidatePath } from "next/cache";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "@/lib/api/collections/mutations";
import {
  CollectionId,
  NewCollectionParams,
  UpdateCollectionParams,
  collectionIdSchema,
  insertCollectionParams,
  updateCollectionParams,
} from "@/lib/db/schema/collections";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCollections = () => revalidatePath("/collections");

export const createCollectionAction = async (input: NewCollectionParams) => {
  try {
    const payload = insertCollectionParams.parse(input);
    await createCollection(payload);
    revalidateCollections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCollectionAction = async (input: UpdateCollectionParams) => {
  try {
    const payload = updateCollectionParams.parse(input);
    await updateCollection(payload.id, payload);
    revalidateCollections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCollectionAction = async (input: CollectionId) => {
  try {
    const payload = collectionIdSchema.parse({ id: input });
    await deleteCollection(payload.id);
    revalidateCollections();
  } catch (e) {
    return handleErrors(e);
  }
};
"use server";

import { revalidatePath } from "next/cache";
import {
  createCollectionImage,
  deleteCollectionImage,
  updateCollectionImage,
} from "@/lib/api/collectionImages/mutations";
import {
  CollectionImageId,
  NewCollectionImageParams,
  UpdateCollectionImageParams,
  collectionImageIdSchema,
  insertCollectionImageParams,
  updateCollectionImageParams,
} from "@/lib/db/schema/collectionImages";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCollectionImages = () => revalidatePath("/collection-images");

export const createCollectionImageAction = async (input: NewCollectionImageParams) => {
  try {
    const payload = insertCollectionImageParams.parse(input);
    await createCollectionImage(payload);
    revalidateCollectionImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCollectionImageAction = async (input: UpdateCollectionImageParams) => {
  try {
    const payload = updateCollectionImageParams.parse(input);
    await updateCollectionImage(payload.id, payload);
    revalidateCollectionImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCollectionImageAction = async (input: CollectionImageId) => {
  try {
    const payload = collectionImageIdSchema.parse({ id: input });
    await deleteCollectionImage(payload.id);
    revalidateCollectionImages();
  } catch (e) {
    return handleErrors(e);
  }
};
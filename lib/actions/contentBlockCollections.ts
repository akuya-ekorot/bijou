"use server";

import { revalidatePath } from "next/cache";
import {
  createContentBlockCollection,
  deleteContentBlockCollection,
  updateContentBlockCollection,
} from "@/lib/api/contentBlockCollections/mutations";
import {
  ContentBlockCollectionId,
  NewContentBlockCollectionParams,
  UpdateContentBlockCollectionParams,
  contentBlockCollectionIdSchema,
  insertContentBlockCollectionParams,
  updateContentBlockCollectionParams,
} from "@/lib/db/schema/contentBlockCollections";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateContentBlockCollections = () => revalidatePath("/content-block-collections");

export const createContentBlockCollectionAction = async (input: NewContentBlockCollectionParams) => {
  try {
    const payload = insertContentBlockCollectionParams.parse(input);
    await createContentBlockCollection(payload);
    revalidateContentBlockCollections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateContentBlockCollectionAction = async (input: UpdateContentBlockCollectionParams) => {
  try {
    const payload = updateContentBlockCollectionParams.parse(input);
    await updateContentBlockCollection(payload.id, payload);
    revalidateContentBlockCollections();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteContentBlockCollectionAction = async (input: ContentBlockCollectionId) => {
  try {
    const payload = contentBlockCollectionIdSchema.parse({ id: input });
    await deleteContentBlockCollection(payload.id);
    revalidateContentBlockCollections();
  } catch (e) {
    return handleErrors(e);
  }
};
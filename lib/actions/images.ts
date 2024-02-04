"use server";

import { revalidatePath } from "next/cache";
import {
  createImage,
  deleteImage,
  updateImage,
} from "@/lib/api/images/mutations";
import {
  ImageId,
  NewImageParams,
  UpdateImageParams,
  imageIdSchema,
  insertImageParams,
  updateImageParams,
} from "@/lib/db/schema/images";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateImages = () => revalidatePath("/images");

export const createImageAction = async (input: NewImageParams) => {
  try {
    const payload = insertImageParams.parse(input);
    await createImage(payload);
    revalidateImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateImageAction = async (input: UpdateImageParams) => {
  try {
    const payload = updateImageParams.parse(input);
    await updateImage(payload.id, payload);
    revalidateImages();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteImageAction = async (input: ImageId) => {
  try {
    const payload = imageIdSchema.parse({ id: input });
    await deleteImage(payload.id);
    revalidateImages();
  } catch (e) {
    return handleErrors(e);
  }
};
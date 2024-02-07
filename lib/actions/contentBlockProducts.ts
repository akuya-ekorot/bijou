'use server';

import { revalidatePath } from 'next/cache';
import {
  createContentBlockProduct,
  deleteContentBlockProduct,
  updateContentBlockProduct,
} from '@/lib/api/contentBlockProducts/mutations';
import {
  ContentBlockProductId,
  NewContentBlockProductParams,
  UpdateContentBlockProductParams,
  contentBlockProductIdSchema,
  insertContentBlockProductParams,
  updateContentBlockProductParams,
} from '@/lib/db/schema/contentBlockProducts';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateContentBlockProducts = () =>
  revalidatePath('/content-block-products');

export const createContentBlockProductAction = async (
  input: NewContentBlockProductParams,
) => {
  try {
    const payload = insertContentBlockProductParams.parse(input);
    await createContentBlockProduct(payload);
    revalidateContentBlockProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateContentBlockProductAction = async (
  input: UpdateContentBlockProductParams,
) => {
  try {
    const payload = updateContentBlockProductParams.parse(input);
    await updateContentBlockProduct(payload.id, payload);
    revalidateContentBlockProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteContentBlockProductAction = async (
  input: ContentBlockProductId,
) => {
  try {
    const payload = contentBlockProductIdSchema.parse({ id: input });
    await deleteContentBlockProduct(payload.id);
    revalidateContentBlockProducts();
  } catch (e) {
    return handleErrors(e);
  }
};

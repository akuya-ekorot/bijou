'use server';

import { revalidatePath } from 'next/cache';
import {
  createContentBlock,
  deleteContentBlock,
  updateContentBlock,
} from '@/lib/api/contentBlocks/mutations';
import {
  ContentBlockId,
  NewContentBlockParams,
  UpdateContentBlockParams,
  contentBlockIdSchema,
  insertContentBlockParams,
  updateContentBlockParams,
} from '@/lib/db/schema/contentBlocks';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateContentBlocks = () => revalidatePath('/content-blocks');

export const createContentBlockAction = async (
  input: NewContentBlockParams,
) => {
  try {
    const payload = insertContentBlockParams.parse(input);
    await createContentBlock(payload);
    revalidateContentBlocks();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateContentBlockAction = async (
  input: UpdateContentBlockParams,
) => {
  try {
    const payload = updateContentBlockParams.parse(input);
    await updateContentBlock(payload.id, payload);
    revalidateContentBlocks();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteContentBlockAction = async (input: ContentBlockId) => {
  try {
    const payload = contentBlockIdSchema.parse({ id: input });
    await deleteContentBlock(payload.id);
    revalidateContentBlocks();
  } catch (e) {
    return handleErrors(e);
  }
};

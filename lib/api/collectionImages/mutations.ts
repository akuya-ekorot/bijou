import { db } from '@/lib/db/index';
import { and, eq } from 'drizzle-orm';
import {
  CollectionImageId,
  NewCollectionImageParams,
  UpdateCollectionImageParams,
  updateCollectionImageSchema,
  insertCollectionImageSchema,
  collectionImages,
  collectionImageIdSchema,
} from '@/lib/db/schema/collectionImages';
import { getUserAuth } from '@/lib/auth/utils';

export const createCollectionImage = async (
  collectionImage: NewCollectionImageParams,
) => {
  const { session } = await getUserAuth();
  const newCollectionImage = insertCollectionImageSchema.parse({
    ...collectionImage,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .insert(collectionImages)
      .values(newCollectionImage)
      .returning();
    return { collectionImage: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateCollectionImage = async (
  id: CollectionImageId,
  collectionImage: UpdateCollectionImageParams,
) => {
  const { session } = await getUserAuth();
  const { id: collectionImageId } = collectionImageIdSchema.parse({ id });
  const newCollectionImage = updateCollectionImageSchema.parse({
    ...collectionImage,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .update(collectionImages)
      .set({ ...newCollectionImage, updatedAt: new Date() })
      .where(
        and(
          eq(collectionImages.id, collectionImageId!),
          eq(collectionImages.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collectionImage: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteCollectionImage = async (id: CollectionImageId) => {
  const { session } = await getUserAuth();
  const { id: collectionImageId } = collectionImageIdSchema.parse({ id });
  try {
    const [c] = await db
      .delete(collectionImages)
      .where(
        and(
          eq(collectionImages.id, collectionImageId!),
          eq(collectionImages.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collectionImage: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

import { db } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import {
  CollectionProductId,
  NewCollectionProductParams,
  UpdateCollectionProductParams,
  updateCollectionProductSchema,
  insertCollectionProductSchema,
  collectionProducts,
  collectionProductIdSchema,
} from '@/lib/db/schema/collectionProducts';

export const createCollectionProduct = async (
  collectionProduct: NewCollectionProductParams,
) => {
  const newCollectionProduct =
    insertCollectionProductSchema.parse(collectionProduct);
  try {
    const [c] = await db
      .insert(collectionProducts)
      .values(newCollectionProduct)
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateCollectionProduct = async (
  id: CollectionProductId,
  collectionProduct: UpdateCollectionProductParams,
) => {
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  const newCollectionProduct =
    updateCollectionProductSchema.parse(collectionProduct);
  try {
    const [c] = await db
      .update(collectionProducts)
      .set({ ...newCollectionProduct, updatedAt: new Date() })
      .where(eq(collectionProducts.id, collectionProductId!))
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteCollectionProduct = async (id: CollectionProductId) => {
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  try {
    const [c] = await db
      .delete(collectionProducts)
      .where(eq(collectionProducts.id, collectionProductId!))
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

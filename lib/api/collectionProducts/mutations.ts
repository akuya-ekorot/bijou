import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
  CollectionProductId,
  NewCollectionProductParams,
  UpdateCollectionProductParams,
  collectionProductIdSchema,
  collectionProducts,
  insertCollectionProductSchema,
  updateCollectionProductSchema,
} from "@/lib/db/schema/collectionProducts";
import { and, eq } from "drizzle-orm";

export const createCollectionProduct = async (
  collectionProduct: NewCollectionProductParams,
) => {
  const { session } = await getUserAuth();
  const newCollectionProduct = insertCollectionProductSchema.parse({
    ...collectionProduct,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .insert(collectionProducts)
      .values(newCollectionProduct)
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateCollectionProduct = async (
  id: CollectionProductId,
  collectionProduct: UpdateCollectionProductParams,
) => {
  const { session } = await getUserAuth();
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  const newCollectionProduct = updateCollectionProductSchema.parse({
    ...collectionProduct,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .update(collectionProducts)
      .set({ ...newCollectionProduct, updatedAt: new Date() })
      .where(
        and(
          eq(collectionProducts.id, collectionProductId!),
          eq(collectionProducts.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteCollectionProduct = async (id: CollectionProductId) => {
  const { session } = await getUserAuth();
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  try {
    const [c] = await db
      .delete(collectionProducts)
      .where(
        and(
          eq(collectionProducts.id, collectionProductId!),
          eq(collectionProducts.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collectionProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

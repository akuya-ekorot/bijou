import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
  CollectionId,
  NewCollectionParams,
  UpdateCollectionParams,
  collectionIdSchema,
  collections,
  insertCollectionSchema,
  updateCollectionSchema,
} from "@/lib/db/schema/collections";
import { and, eq } from "drizzle-orm";

export const createCollection = async (collection: NewCollectionParams) => {
  const { session } = await getUserAuth();
  const newCollection = insertCollectionSchema.parse({
    ...collection,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db.insert(collections).values(newCollection).returning();
    return { collection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateCollection = async (
  id: CollectionId,
  collection: UpdateCollectionParams,
) => {
  const { session } = await getUserAuth();
  const { id: collectionId } = collectionIdSchema.parse({ id });
  const newCollection = updateCollectionSchema.parse({
    ...collection,
    userId: session?.user.id!,
  });
  try {
    const [c] = await db
      .update(collections)
      .set({ ...newCollection, updatedAt: new Date() })
      .where(
        and(
          eq(collections.id, collectionId!),
          eq(collections.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteCollection = async (id: CollectionId) => {
  const { session } = await getUserAuth();
  const { id: collectionId } = collectionIdSchema.parse({ id });
  try {
    const [c] = await db
      .delete(collections)
      .where(
        and(
          eq(collections.id, collectionId!),
          eq(collections.userId, session?.user.id!),
        ),
      )
      .returning();
    return { collection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

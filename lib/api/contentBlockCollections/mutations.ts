import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ContentBlockCollectionId, 
  NewContentBlockCollectionParams,
  UpdateContentBlockCollectionParams, 
  updateContentBlockCollectionSchema,
  insertContentBlockCollectionSchema, 
  contentBlockCollections,
  contentBlockCollectionIdSchema 
} from "@/lib/db/schema/contentBlockCollections";
import { getUserAuth } from "@/lib/auth/utils";

export const createContentBlockCollection = async (contentBlockCollection: NewContentBlockCollectionParams) => {
  const { session } = await getUserAuth();
  const newContentBlockCollection = insertContentBlockCollectionSchema.parse({ ...contentBlockCollection, userId: session?.user.id! });
  try {
    const [c] =  await db.insert(contentBlockCollections).values(newContentBlockCollection).returning();
    return { contentBlockCollection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateContentBlockCollection = async (id: ContentBlockCollectionId, contentBlockCollection: UpdateContentBlockCollectionParams) => {
  const { session } = await getUserAuth();
  const { id: contentBlockCollectionId } = contentBlockCollectionIdSchema.parse({ id });
  const newContentBlockCollection = updateContentBlockCollectionSchema.parse({ ...contentBlockCollection, userId: session?.user.id! });
  try {
    const [c] =  await db
     .update(contentBlockCollections)
     .set({...newContentBlockCollection, updatedAt: new Date() })
     .where(and(eq(contentBlockCollections.id, contentBlockCollectionId!), eq(contentBlockCollections.userId, session?.user.id!)))
     .returning();
    return { contentBlockCollection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteContentBlockCollection = async (id: ContentBlockCollectionId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockCollectionId } = contentBlockCollectionIdSchema.parse({ id });
  try {
    const [c] =  await db.delete(contentBlockCollections).where(and(eq(contentBlockCollections.id, contentBlockCollectionId!), eq(contentBlockCollections.userId, session?.user.id!)))
    .returning();
    return { contentBlockCollection: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};


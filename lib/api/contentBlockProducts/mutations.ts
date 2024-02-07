import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ContentBlockProductId, 
  NewContentBlockProductParams,
  UpdateContentBlockProductParams, 
  updateContentBlockProductSchema,
  insertContentBlockProductSchema, 
  contentBlockProducts,
  contentBlockProductIdSchema 
} from "@/lib/db/schema/contentBlockProducts";
import { getUserAuth } from "@/lib/auth/utils";

export const createContentBlockProduct = async (contentBlockProduct: NewContentBlockProductParams) => {
  const { session } = await getUserAuth();
  const newContentBlockProduct = insertContentBlockProductSchema.parse({ ...contentBlockProduct, userId: session?.user.id! });
  try {
    const [c] =  await db.insert(contentBlockProducts).values(newContentBlockProduct).returning();
    return { contentBlockProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateContentBlockProduct = async (id: ContentBlockProductId, contentBlockProduct: UpdateContentBlockProductParams) => {
  const { session } = await getUserAuth();
  const { id: contentBlockProductId } = contentBlockProductIdSchema.parse({ id });
  const newContentBlockProduct = updateContentBlockProductSchema.parse({ ...contentBlockProduct, userId: session?.user.id! });
  try {
    const [c] =  await db
     .update(contentBlockProducts)
     .set({...newContentBlockProduct, updatedAt: new Date() })
     .where(and(eq(contentBlockProducts.id, contentBlockProductId!), eq(contentBlockProducts.userId, session?.user.id!)))
     .returning();
    return { contentBlockProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteContentBlockProduct = async (id: ContentBlockProductId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockProductId } = contentBlockProductIdSchema.parse({ id });
  try {
    const [c] =  await db.delete(contentBlockProducts).where(and(eq(contentBlockProducts.id, contentBlockProductId!), eq(contentBlockProducts.userId, session?.user.id!)))
    .returning();
    return { contentBlockProduct: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};


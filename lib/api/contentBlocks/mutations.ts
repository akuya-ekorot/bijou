import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  ContentBlockId, 
  NewContentBlockParams,
  UpdateContentBlockParams, 
  updateContentBlockSchema,
  insertContentBlockSchema, 
  contentBlocks,
  contentBlockIdSchema 
} from "@/lib/db/schema/contentBlocks";
import { getUserAuth } from "@/lib/auth/utils";

export const createContentBlock = async (contentBlock: NewContentBlockParams) => {
  const { session } = await getUserAuth();
  const newContentBlock = insertContentBlockSchema.parse({ ...contentBlock, userId: session?.user.id! });
  try {
    const [c] =  await db.insert(contentBlocks).values(newContentBlock).returning();
    return { contentBlock: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateContentBlock = async (id: ContentBlockId, contentBlock: UpdateContentBlockParams) => {
  const { session } = await getUserAuth();
  const { id: contentBlockId } = contentBlockIdSchema.parse({ id });
  const newContentBlock = updateContentBlockSchema.parse({ ...contentBlock, userId: session?.user.id! });
  try {
    const [c] =  await db
     .update(contentBlocks)
     .set({...newContentBlock, updatedAt: new Date() })
     .where(and(eq(contentBlocks.id, contentBlockId!), eq(contentBlocks.userId, session?.user.id!)))
     .returning();
    return { contentBlock: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteContentBlock = async (id: ContentBlockId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockId } = contentBlockIdSchema.parse({ id });
  try {
    const [c] =  await db.delete(contentBlocks).where(and(eq(contentBlocks.id, contentBlockId!), eq(contentBlocks.userId, session?.user.id!)))
    .returning();
    return { contentBlock: c };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};


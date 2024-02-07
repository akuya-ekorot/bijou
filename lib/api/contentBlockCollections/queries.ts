import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ContentBlockCollectionId, contentBlockCollectionIdSchema, contentBlockCollections } from "@/lib/db/schema/contentBlockCollections";
import { collections } from "@/lib/db/schema/collections";
import { contentBlocks } from "@/lib/db/schema/contentBlocks";

export const getContentBlockCollections = async () => {
  const { session } = await getUserAuth();
  const rows = await db.select({ contentBlockCollection: contentBlockCollections, collection: collections, contentBlock: contentBlocks }).from(contentBlockCollections).leftJoin(collections, eq(contentBlockCollections.collectionId, collections.id)).leftJoin(contentBlocks, eq(contentBlockCollections.contentBlockId, contentBlocks.id)).where(eq(contentBlockCollections.userId, session?.user.id!));
  const c = rows .map((r) => ({ ...r.contentBlockCollection, collection: r.collection, contentBlock: r.contentBlock})); 
  return { contentBlockCollections: c };
};

export const getContentBlockCollectionById = async (id: ContentBlockCollectionId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockCollectionId } = contentBlockCollectionIdSchema.parse({ id });
  const [row] = await db.select({ contentBlockCollection: contentBlockCollections, collection: collections, contentBlock: contentBlocks }).from(contentBlockCollections).where(and(eq(contentBlockCollections.id, contentBlockCollectionId), eq(contentBlockCollections.userId, session?.user.id!))).leftJoin(collections, eq(contentBlockCollections.collectionId, collections.id)).leftJoin(contentBlocks, eq(contentBlockCollections.contentBlockId, contentBlocks.id));
  if (row === undefined) return {};
  const c =  { ...row.contentBlockCollection, collection: row.collection, contentBlock: row.contentBlock } ;
  return { contentBlockCollection: c };
};



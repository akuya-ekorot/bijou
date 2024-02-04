import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type CollectionId,
  collectionIdSchema,
  collections,
} from "@/lib/db/schema/collections";

export const getCollections = async () => {
  const { session } = await getUserAuth();
  const c = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, session?.user.id!));
  return { collections: c };
};

export const getCollectionById = async (id: CollectionId) => {
  const { session } = await getUserAuth();
  const { id: collectionId } = collectionIdSchema.parse({ id });
  const [c] = await db
    .select()
    .from(collections)
    .where(
      and(
        eq(collections.id, collectionId),
        eq(collections.userId, session?.user.id!),
      ),
    );
  return { collection: c };
};

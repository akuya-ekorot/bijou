import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
  collectionIdSchema,
  collections,
  type CollectionId,
} from "@/lib/db/schema/collections";
import { shops } from "@/lib/db/schema/shops";
import { and, eq } from "drizzle-orm";

export const getCollections = async () => {
  const { session } = await getUserAuth();
  const c = await db
    .select({ collection: collections, shop: shops })
    .from(collections)
    .leftJoin(shops, eq(collections.shopId, shops.id))
    .where(eq(collections.userId, session?.user.id!));
  return { collections: c };
};

export const getCollectionById = async (id: CollectionId) => {
  const { session } = await getUserAuth();
  const { id: collectionId } = collectionIdSchema.parse({ id });
  const [c] = await db
    .select({ collection: collections, shop: shops })
    .from(collections)
    .where(
      and(
        eq(collections.id, collectionId),
        eq(collections.userId, session?.user.id!),
      ),
    )
    .leftJoin(shops, eq(collections.shopId, shops.id));
  return { collection: c };
};

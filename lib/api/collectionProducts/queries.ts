import { getUserAuth } from "@/lib/auth/utils";
import { db } from "@/lib/db/index";
import {
  collectionProductIdSchema,
  collectionProducts,
  type CollectionProductId,
} from "@/lib/db/schema/collectionProducts";
import { collections } from "@/lib/db/schema/collections";
import { products } from "@/lib/db/schema/products";
import { and, eq } from "drizzle-orm";

export const getCollectionProducts = async () => {
  const { session } = await getUserAuth();
  const c = await db
    .select({
      collectionProduct: collectionProducts,
      collection: collections,
      product: products,
    })
    .from(collectionProducts)
    .leftJoin(collections, eq(collectionProducts.collectionId, collections.id))
    .leftJoin(products, eq(collectionProducts.productId, products.id))
    .where(eq(collectionProducts.userId, session?.user.id!));
  return { collectionProducts: c };
};

export const getCollectionProductById = async (id: CollectionProductId) => {
  const { session } = await getUserAuth();
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  const [c] = await db
    .select({
      collectionProduct: collectionProducts,
      collection: collections,
      product: products,
    })
    .from(collectionProducts)
    .where(
      and(
        eq(collectionProducts.id, collectionProductId),
        eq(collectionProducts.userId, session?.user.id!),
      ),
    )
    .leftJoin(collections, eq(collectionProducts.collectionId, collections.id))
    .leftJoin(products, eq(collectionProducts.productId, products.id));
  return { collectionProduct: c };
};

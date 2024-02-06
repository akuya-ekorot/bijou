import { db } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import {
  type CollectionProductId,
  collectionProductIdSchema,
  collectionProducts,
} from '@/lib/db/schema/collectionProducts';
import { collections } from '@/lib/db/schema/collections';
import { products } from '@/lib/db/schema/products';

export const getCollectionProducts = async () => {
  const c = await db
    .select({
      collectionProduct: collectionProducts,
      collection: collections,
      product: products,
    })
    .from(collectionProducts)
    .leftJoin(collections, eq(collectionProducts.collectionId, collections.id))
    .leftJoin(products, eq(collectionProducts.productId, products.id));
  return { collectionProducts: c };
};

export const getCollectionProductById = async (id: CollectionProductId) => {
  const { id: collectionProductId } = collectionProductIdSchema.parse({ id });
  const [c] = await db
    .select({
      collectionProduct: collectionProducts,
      collection: collections,
      product: products,
    })
    .from(collectionProducts)
    .where(eq(collectionProducts.id, collectionProductId))
    .leftJoin(collections, eq(collectionProducts.collectionId, collections.id))
    .leftJoin(products, eq(collectionProducts.productId, products.id));
  return { collectionProduct: c };
};

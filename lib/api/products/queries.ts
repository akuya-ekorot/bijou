import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type ProductId,
  productIdSchema,
  products,
  Product,
} from "@/lib/db/schema/products";
import { Collection, collections } from "@/lib/db/schema/collections";
import { collectionProducts } from "@/lib/db/schema/collectionProducts";

export const getProducts = async () => {
  const { session } = await getUserAuth();
  const p = await db
    .select({ product: products, collection: collections })
    .from(products)
    .where(eq(products.userId, session?.user.id!))
    .leftJoin(collectionProducts, eq(collectionProducts.productId, products.id))
    .leftJoin(collections, eq(collections.id, collectionProducts.collectionId));

  const pp = new Map();

  for (const { collection, product } of p) {
    if (!pp.has(product.id)) {
      pp.set(product.id, {
        ...product,
        collections: [],
      });
    }

    if (collection) {
      const col = pp.get(product.id);
      col.collections.push(collection);
    }
  }

  return {
    products: Array.from(pp.values()) as Array<
      Product & { collections: Array<Collection> }
    >,
  };
};

export const getProductById = async (id: ProductId) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  const p = await db
    .select({ product: products, collection: collections })
    .from(products)
    .where(
      and(eq(products.id, productId), eq(products.userId, session?.user.id!)),
    )
    .leftJoin(collectionProducts, eq(collectionProducts.productId, products.id))
    .leftJoin(collections, eq(collections.id, collectionProducts.collectionId));

  const pp = new Map();

  for (const { collection, product } of p) {
    if (!pp.has(product.id)) {
      pp.set(product.id, {
        ...product,
        collections: [],
      });
    }

    if (collection) {
      const col = pp.get(product.id);
      col.collections.push(collection);
    }
  }

  return {
    product: Array.from(pp.values())[0] as Product & {
      collections: Array<Collection>;
    },
  };
};

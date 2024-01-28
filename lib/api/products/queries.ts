import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type ProductId,
  productIdSchema,
  products,
  ProductShopId,
  productShopIdSchema,
  Product,
} from "@/lib/db/schema/products";
import { Shop, shops } from "@/lib/db/schema/shops";
import { Collection, collections } from "@/lib/db/schema/collections";
import { collectionProducts } from "@/lib/db/schema/collectionProducts";

export const getProducts = async () => {
  const { session } = await getUserAuth();
  const p = await db
    .select({ product: products, shop: shops })
    .from(products)
    .leftJoin(shops, eq(products.shopId, shops.id))
    .where(eq(products.userId, session?.user.id!));
  return { products: p };
};

export const getProductById = async (id: ProductId) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  const [p] = await db
    .select({ product: products, shop: shops })
    .from(products)
    .where(
      and(eq(products.id, productId), eq(products.userId, session?.user.id!)),
    )
    .leftJoin(shops, eq(products.shopId, shops.id));
  return { product: p };
};

export const getProductsByShopId = async (shopId: ProductShopId) => {
  const { session } = await getUserAuth();
  const { shopId: productShopId } = productShopIdSchema.parse({ shopId });

  const p = await db
    .select({ product: products, shop: shops, collection: collections })
    .from(products)
    .where(
      and(
        eq(products.shopId, productShopId),
        eq(products.userId, session?.user.id!),
      ),
    )
    .leftJoin(shops, eq(products.shopId, shops.id))
    .leftJoin(collectionProducts, eq(products.id, collectionProducts.productId))
    .leftJoin(collections, eq(collectionProducts.collectionId, collections.id));

  const pp = new Map();

  for (const { product, shop, collection } of p) {
    const existingProduct = pp.get(product.id);

    if (existingProduct) {
      existingProduct.collections.push(collection);
    } else {
      pp.set(product.id, {
        product,
        shop,
        collections: collection ? [collection] : [],
      });
    }
  }

  return {
    products: Array.from(pp.values()) as {
      product: Product;
      shop: Shop;
      collections: Collection[];
    }[],
  };
};

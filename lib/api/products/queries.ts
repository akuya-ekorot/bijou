import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type ProductId,
  productIdSchema,
  products,
  ProductShopId,
  productShopIdSchema,
} from "@/lib/db/schema/products";
import { shops } from "@/lib/db/schema/shops";

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
    .select({ product: products, shop: shops })
    .from(products)
    .where(
      and(
        eq(products.shopId, productShopId),
        eq(products.userId, session?.user.id!),
      ),
    )
    .leftJoin(shops, eq(products.shopId, shops.id));
  return { products: p };
};

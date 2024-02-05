import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type ProductId,
  productIdSchema,
  products,
} from "@/lib/db/schema/products";
import { collections } from "@/lib/db/schema/collections";

export const getProducts = async () => {
  const { session } = await getUserAuth();
  const p = await db
    .select({ product: products, collection: collections })
    .from(products)
    .where(eq(products.userId, session?.user.id!));
  return { products: p };
};

export const getProductById = async (id: ProductId) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  const [p] = await db
    .select()
    .from(products)
    .where(
      and(eq(products.id, productId), eq(products.userId, session?.user.id!)),
    );
  return { product: p };
};

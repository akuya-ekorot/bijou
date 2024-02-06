import { db } from '@/lib/db/index';
import { and, eq } from 'drizzle-orm';
import {
  ProductId,
  NewProductParams,
  UpdateProductParams,
  updateProductSchema,
  insertProductSchema,
  products,
  productIdSchema,
} from '@/lib/db/schema/products';
import { getUserAuth } from '@/lib/auth/utils';

export const createProduct = async (product: NewProductParams) => {
  const { session } = await getUserAuth();
  const newProduct = insertProductSchema.parse({
    ...product,
    userId: session?.user.id!,
  });
  try {
    const [p] = await db.insert(products).values(newProduct).returning();
    return { product: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateProduct = async (
  id: ProductId,
  product: UpdateProductParams,
) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  const newProduct = updateProductSchema.parse({
    ...product,
    userId: session?.user.id!,
  });
  try {
    const [p] = await db
      .update(products)
      .set({ ...newProduct, updatedAt: new Date() })
      .where(
        and(
          eq(products.id, productId!),
          eq(products.userId, session?.user.id!),
        ),
      )
      .returning();
    return { product: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteProduct = async (id: ProductId) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  try {
    const [p] = await db
      .delete(products)
      .where(
        and(
          eq(products.id, productId!),
          eq(products.userId, session?.user.id!),
        ),
      )
      .returning();
    return { product: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

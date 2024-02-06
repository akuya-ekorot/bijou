import { db } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import {
  ProductImageId,
  NewProductImageParams,
  UpdateProductImageParams,
  updateProductImageSchema,
  insertProductImageSchema,
  productImages,
  productImageIdSchema,
} from '@/lib/db/schema/productImages';

export const createProductImage = async (
  productImage: NewProductImageParams,
) => {
  const newProductImage = insertProductImageSchema.parse(productImage);
  try {
    const [p] = await db
      .insert(productImages)
      .values(newProductImage)
      .returning();
    return { productImage: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateProductImage = async (
  id: ProductImageId,
  productImage: UpdateProductImageParams,
) => {
  const { id: productImageId } = productImageIdSchema.parse({ id });
  const newProductImage = updateProductImageSchema.parse(productImage);
  try {
    const [p] = await db
      .update(productImages)
      .set({ ...newProductImage, updatedAt: new Date() })
      .where(eq(productImages.id, productImageId!))
      .returning();
    return { productImage: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteProductImage = async (id: ProductImageId) => {
  const { id: productImageId } = productImageIdSchema.parse({ id });
  try {
    const [p] = await db
      .delete(productImages)
      .where(eq(productImages.id, productImageId!))
      .returning();
    return { productImage: p };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

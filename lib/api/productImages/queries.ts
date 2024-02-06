import { db } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import {
  type ProductImageId,
  productImageIdSchema,
  productImages,
} from '@/lib/db/schema/productImages';
import { products } from '@/lib/db/schema/products';
import { images } from '@/lib/db/schema/images';

export const getProductImages = async () => {
  const p = await db
    .select({ productImage: productImages, product: products, image: images })
    .from(productImages)
    .leftJoin(products, eq(productImages.productId, products.id))
    .leftJoin(images, eq(productImages.imageId, images.id));
  return { productImages: p };
};

export const getProductImageById = async (id: ProductImageId) => {
  const { id: productImageId } = productImageIdSchema.parse({ id });
  const [p] = await db
    .select({ productImage: productImages, product: products, image: images })
    .from(productImages)
    .where(eq(productImages.id, productImageId))
    .leftJoin(products, eq(productImages.productId, products.id))
    .leftJoin(images, eq(productImages.imageId, images.id));
  return { productImage: p };
};

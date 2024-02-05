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
import { TImage, images } from "@/lib/db/schema/images";
import { productImages } from "@/lib/db/schema/productImages";

const formatProduct = (
  p: {
    collection: Collection | null;
    product: Product;
    image: TImage | null;
  }[],
) => {
  const pp = new Map<
    string,
    Product & { images: TImage[]; collections: Collection[] }
  >();

  if (!p) return pp;

  for (const { collection, product, image } of p) {
    if (!pp.has(product.id)) {
      pp.set(product.id, {
        ...product,
        images: [],
        collections: [],
      });
    }

    if (collection) {
      const col = pp.get(product.id);

      const collectionExists = col?.collections.some(
        (c: Collection) => c.id === collection.id,
      );

      if (!collectionExists) {
        col?.collections.push(collection);
      }
    }

    if (image) {
      const col = pp.get(product.id);
      const imageExists = col?.images.some((i: TImage) => i.id === image.id);

      if (!imageExists) {
        col?.images.push(image);
      }
    }
  }

  return pp;
};

export const getProducts = async () => {
  const { session } = await getUserAuth();
  const p = await db
    .select({ product: products, collection: collections, image: images })
    .from(products)
    .where(eq(products.userId, session?.user.id!))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .leftJoin(images, eq(images.id, productImages.imageId))
    .leftJoin(collectionProducts, eq(collectionProducts.productId, products.id))
    .leftJoin(collections, eq(collections.id, collectionProducts.collectionId));

  const pp = formatProduct(p);

  return {
    products: Array.from(pp.values()),
  };
};

export const getProductById = async (id: ProductId) => {
  const { session } = await getUserAuth();
  const { id: productId } = productIdSchema.parse({ id });
  const p = await db
    .select({ product: products, collection: collections, image: images })
    .from(products)
    .where(
      and(eq(products.id, productId), eq(products.userId, session?.user.id!)),
    )
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .leftJoin(images, eq(images.id, productImages.imageId))
    .leftJoin(collectionProducts, eq(collectionProducts.productId, products.id))
    .leftJoin(collections, eq(collections.id, collectionProducts.collectionId));

  const pp = formatProduct(p);

  return {
    product: Array.from(pp.values())[0],
  };
};

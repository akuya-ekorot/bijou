import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import {
  type CollectionId,
  collectionIdSchema,
  collections,
  Collection,
} from "@/lib/db/schema/collections";
import { collectionImages } from "@/lib/db/schema/collectionImages";
import { TImage, images } from "@/lib/db/schema/images";
import { Product, products } from "@/lib/db/schema/products";
import { collectionProducts } from "@/lib/db/schema/collectionProducts";

export const getCollections = async () => {
  const { session } = await getUserAuth();

  const c = await db
    .select({ collection: collections, image: images, product: products })
    .from(collections)
    .where(eq(collections.userId, session?.user.id!))
    .leftJoin(
      collectionImages,
      eq(collections.id, collectionImages.collectionId),
    )
    .leftJoin(images, eq(collectionImages.imageId, images.id))
    .leftJoin(
      collectionProducts,
      eq(collections.id, collectionProducts.collectionId),
    )
    .leftJoin(products, eq(collectionProducts.productId, products.id));

  const cc = new Map();

  for (const { collection, image, product } of c) {
    if (!cc.has(collection.id)) {
      cc.set(collection.id, {
        ...collection,
        images: [],
        products: [],
      });
    }

    if (image) {
      const col = cc.get(collection.id);
      col.images.push(image);
    }

    if (product) {
      const col = cc.get(collection.id);
      col.products.push(product);
    }
  }

  return {
    collections: Array.from(cc.values()) as Array<
      Collection & { images: Array<TImage>; products: Array<Product> }
    >,
  };
};

export const getCollectionById = async (id: CollectionId) => {
  const { session } = await getUserAuth();
  const { id: collectionId } = collectionIdSchema.parse({ id });
  const c = await db
    .select({ collection: collections, image: images, product: products })
    .from(collections)
    .where(
      and(
        eq(collections.id, collectionId),
        eq(collections.userId, session?.user.id!),
      ),
    )
    .leftJoin(
      collectionImages,
      eq(collections.id, collectionImages.collectionId),
    )
    .leftJoin(images, eq(collectionImages.imageId, images.id))
    .leftJoin(
      collectionProducts,
      eq(collections.id, collectionProducts.collectionId),
    )
    .leftJoin(products, eq(collectionProducts.productId, products.id));

  const cc = new Map();

  for (const { collection, image, product } of c) {
    if (!cc.has(collection.id)) {
      cc.set(collection.id, {
        ...collection,
        images: [],
        products: [],
      });
    }

    if (image) {
      const col = cc.get(collection.id);
      col.images.push(image);
    }

    if (product) {
      const col = cc.get(collection.id);
      col.products.push(product);
    }
  }

  return {
    collection: Array.from(cc.values())[0] as Collection & {
      images: Array<TImage>;
      products: Array<Product>;
    },
  };
};

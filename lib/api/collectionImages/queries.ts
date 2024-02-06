import { db } from '@/lib/db/index';
import { eq, and } from 'drizzle-orm';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type CollectionImageId,
  collectionImageIdSchema,
  collectionImages,
} from '@/lib/db/schema/collectionImages';
import { collections } from '@/lib/db/schema/collections';
import { images } from '@/lib/db/schema/images';

export const getCollectionImages = async () => {
  const { session } = await getUserAuth();
  const c = await db
    .select({
      collectionImage: collectionImages,
      collection: collections,
      image: images,
    })
    .from(collectionImages)
    .leftJoin(collections, eq(collectionImages.collectionId, collections.id))
    .leftJoin(images, eq(collectionImages.imageId, images.id))
    .where(eq(collectionImages.userId, session?.user.id!));
  return { collectionImages: c };
};

export const getCollectionImageById = async (id: CollectionImageId) => {
  const { session } = await getUserAuth();
  const { id: collectionImageId } = collectionImageIdSchema.parse({ id });
  const [c] = await db
    .select({
      collectionImage: collectionImages,
      collection: collections,
      image: images,
    })
    .from(collectionImages)
    .where(
      and(
        eq(collectionImages.id, collectionImageId),
        eq(collectionImages.userId, session?.user.id!),
      ),
    )
    .leftJoin(collections, eq(collectionImages.collectionId, collections.id))
    .leftJoin(images, eq(collectionImages.imageId, images.id));
  return { collectionImage: c };
};

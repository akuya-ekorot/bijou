import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getContentBlockCollectionById } from '@/lib/api/contentBlockCollections/queries';
import { getCollections } from '@/lib/api/collections/queries';
import { getContentBlocks } from '@/lib/api/contentBlocks/queries';
import OptimisticContentBlockCollection from '@/app/[shopSlug]/content-block-collections/[contentBlockCollectionId]/OptimisticContentBlockCollection';
import { checkAuth } from '@/lib/auth/utils';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function ContentBlockCollectionPage({
  params,
}: {
  params: { contentBlockCollectionId: string };
}) {
  return (
    <main className="overflow-auto">
      <ContentBlockCollection id={params.contentBlockCollectionId} />
    </main>
  );
}

const ContentBlockCollection = async ({ id }: { id: string }) => {
  await checkAuth();

  const { contentBlockCollection } = await getContentBlockCollectionById(id);
  const { collections } = await getCollections();
  const { contentBlocks } = await getContentBlocks();

  if (!contentBlockCollection) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="content-block-collections" />
        <OptimisticContentBlockCollection
          contentBlockCollection={contentBlockCollection}
          collections={collections}
          collectionId={contentBlockCollection.collectionId}
          contentBlocks={contentBlocks}
          contentBlockId={contentBlockCollection.contentBlockId}
        />
      </div>
    </Suspense>
  );
};

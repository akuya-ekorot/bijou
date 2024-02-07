import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getContentBlockByIdWithContentBlockProductsAndContentBlockCollections } from '@/lib/api/contentBlocks/queries';
import { getPages } from '@/lib/api/pages/queries';
import OptimisticContentBlock from './OptimisticContentBlock';
import { checkAuth } from '@/lib/auth/utils';
import ContentBlockProductList from '@/components/contentBlockProducts/ContentBlockProductList';
import ContentBlockCollectionList from '@/components/contentBlockCollections/ContentBlockCollectionList';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';
import { getProducts } from '@/lib/api/products/queries';
import { getCollections } from '@/lib/api/collections/queries';

export const revalidate = 0;

export default async function ContentBlockPage({
  params,
}: {
  params: { contentBlockId: string };
}) {
  return (
    <main className="overflow-auto">
      <ContentBlock id={params.contentBlockId} />
    </main>
  );
}

const ContentBlock = async ({ id }: { id: string }) => {
  await checkAuth();

  const { contentBlock, contentBlockProducts, contentBlockCollections } =
    await getContentBlockByIdWithContentBlockProductsAndContentBlockCollections(
      id,
    );
  const { pages } = await getPages();
  const { products } = await getProducts();
  const { collections } = await getCollections();

  if (!contentBlock) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="content-blocks" />
        <OptimisticContentBlock contentBlock={contentBlock} pages={pages} />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {contentBlock.title}&apos;s Content Block Products
        </h3>
        <ContentBlockProductList
          products={products}
          contentBlocks={[]}
          contentBlockId={contentBlock.id}
          contentBlockProducts={contentBlockProducts}
        />
      </div>
      <div className="relative mt-8 mx-4">
        <h3 className="text-xl font-medium mb-4">
          {contentBlock.title}&apos;s Content Block Collections
        </h3>
        <ContentBlockCollectionList
          collections={collections}
          contentBlocks={[]}
          contentBlockId={contentBlock.id}
          contentBlockCollections={contentBlockCollections}
        />
      </div>
    </Suspense>
  );
};

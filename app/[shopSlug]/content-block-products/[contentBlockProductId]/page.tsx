import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getContentBlockProductById } from '@/lib/api/contentBlockProducts/queries';
import { getProducts } from '@/lib/api/products/queries';
import { getContentBlocks } from '@/lib/api/contentBlocks/queries';
import OptimisticContentBlockProduct from '@/app/[shopSlug]/content-block-products/[contentBlockProductId]/OptimisticContentBlockProduct';
import { checkAuth } from '@/lib/auth/utils';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function ContentBlockProductPage({
  params,
}: {
  params: { contentBlockProductId: string };
}) {
  return (
    <main className="overflow-auto">
      <ContentBlockProduct id={params.contentBlockProductId} />
    </main>
  );
}

const ContentBlockProduct = async ({ id }: { id: string }) => {
  await checkAuth();

  const { contentBlockProduct } = await getContentBlockProductById(id);
  const { products } = await getProducts();
  const { contentBlocks } = await getContentBlocks();

  if (!contentBlockProduct) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="content-block-products" />
        <OptimisticContentBlockProduct
          contentBlockProduct={contentBlockProduct}
          products={products}
          contentBlocks={contentBlocks}
        />
      </div>
    </Suspense>
  );
};

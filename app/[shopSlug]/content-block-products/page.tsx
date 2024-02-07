import { Suspense } from 'react';

import Loading from '@/app/loading';
import ContentBlockProductList from '@/components/contentBlockProducts/ContentBlockProductList';
import { getContentBlockProducts } from '@/lib/api/contentBlockProducts/queries';
import { getProducts } from '@/lib/api/products/queries';
import { getContentBlocks } from '@/lib/api/contentBlocks/queries';
import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function ContentBlockProductsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">
            Content Block Products
          </h1>
        </div>
        <ContentBlockProducts />
      </div>
    </main>
  );
}

const ContentBlockProducts = async () => {
  await checkAuth();

  const { contentBlockProducts } = await getContentBlockProducts();
  const { products } = await getProducts();
  const { contentBlocks } = await getContentBlocks();
  return (
    <Suspense fallback={<Loading />}>
      <ContentBlockProductList
        contentBlockProducts={contentBlockProducts}
        products={products}
        contentBlocks={contentBlocks}
      />
    </Suspense>
  );
};

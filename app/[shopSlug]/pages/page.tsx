import { Suspense } from 'react';

import Loading from '@/app/loading';
import PageList from '@/components/pages/PageList';
import { getPages } from '@/lib/api/pages/queries';

import { checkAuth } from '@/lib/auth/utils';
import { getShopBySlug } from '@/lib/api/shops/queries';

export const revalidate = 0;

export default async function PagesPage({
  params: { shopSlug },
}: {
  params: { shopSlug: string };
}) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Pages</h1>
        </div>
        <Pages shopSlug={shopSlug} />
      </div>
    </main>
  );
}

const Pages = async ({ shopSlug }: { shopSlug: string }) => {
  await checkAuth();

  const { pages } = await getPages();
  const { shop } = await getShopBySlug(shopSlug);

  return (
    <Suspense fallback={<Loading />}>
      <PageList shopId={shop.id} pages={pages} />
    </Suspense>
  );
};

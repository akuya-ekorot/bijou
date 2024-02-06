import { Suspense } from 'react';

import Loading from '@/app/loading';
import HeroList from '@/components/heroes/HeroList';
import { getHeroes } from '@/lib/api/heroes/queries';

import { checkAuth } from '@/lib/auth/utils';
import { getShopBySlug } from '@/lib/api/shops/queries';

export const revalidate = 0;

export default async function HeroesPage({
  params: { shopSlug },
}: {
  params: { shopSlug: string };
}) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Heroes</h1>
        </div>
        <Heroes shopSlug={shopSlug} />
      </div>
    </main>
  );
}

const Heroes = async ({ shopSlug }: { shopSlug: string }) => {
  await checkAuth();

  const { heroes } = await getHeroes();
  const { shop } = await getShopBySlug(shopSlug);

  return (
    <Suspense fallback={<Loading />}>
      <HeroList shopId={shop.id} heroes={heroes} />
    </Suspense>
  );
};

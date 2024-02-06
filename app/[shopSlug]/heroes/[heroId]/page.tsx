import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { getHeroById } from '@/lib/api/heroes/queries';
import OptimisticHero from './OptimisticHero';
import { checkAuth } from '@/lib/auth/utils';

import { BackButton } from '@/components/shared/BackButton';
import Loading from '@/app/loading';
import { getShopBySlug } from '@/lib/api/shops/queries';

export const revalidate = 0;

export default async function HeroPage({
  params,
}: {
  params: { heroId: string; shopSlug: string };
}) {
  return (
    <main className="overflow-auto">
      <Hero shopSlug={params.shopSlug} id={params.heroId} />
    </main>
  );
}

const Hero = async ({ id, shopSlug }: { id: string; shopSlug: string }) => {
  await checkAuth();

  const { hero } = await getHeroById(id);
  const { shop } = await getShopBySlug(shopSlug);

  if (!hero) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <BackButton currentResource="heroes" />
        <OptimisticHero shopId={shop.id} hero={hero} />
      </div>
    </Suspense>
  );
};

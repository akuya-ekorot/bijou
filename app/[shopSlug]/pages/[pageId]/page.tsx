import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getPageById } from '@/lib/api/pages/queries';
import OptimisticPage from './OptimisticPage';
import { checkAuth } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Loading from '@/app/loading';
import { getShopBySlug } from '@/lib/api/shops/queries';

export const revalidate = 0;

export default async function PagePage({
  params,
}: {
  params: { pageId: string; shopSlug: string };
}) {
  return (
    <main className="overflow-auto">
      <Page shopSlug={params.shopSlug} id={params.pageId} />
    </main>
  );
}

const Page = async ({ id, shopSlug }: { id: string; shopSlug: string }) => {
  await checkAuth();

  const { page } = await getPageById(id);
  const { shop } = await getShopBySlug(shopSlug);

  if (!page) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="../pages">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticPage shopId={shop.id} page={page} />
      </div>
    </Suspense>
  );
};

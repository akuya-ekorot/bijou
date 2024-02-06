import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getImageById } from '@/lib/api/images/queries';
import OptimisticImage from './OptimisticImage';
import { checkAuth } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function ImagePage({
  params,
}: {
  params: { imageId: string };
}) {
  return (
    <main className="overflow-auto">
      <Image id={params.imageId} />
    </main>
  );
}

const Image = async ({ id }: { id: string }) => {
  await checkAuth();

  const { image } = await getImageById(id);

  if (!image) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/images">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticImage image={image} />
      </div>
    </Suspense>
  );
};

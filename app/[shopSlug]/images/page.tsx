import { Suspense } from 'react';

import Loading from '@/app/loading';
import ImageList from '@/components/images/ImageList';
import { getImages } from '@/lib/api/images/queries';

import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function ImagesPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Images</h1>
        </div>
        <Images />
      </div>
    </main>
  );
}

const Images = async () => {
  await checkAuth();

  const { images } = await getImages();

  return (
    <Suspense fallback={<Loading />}>
      <ImageList images={images} />
    </Suspense>
  );
};

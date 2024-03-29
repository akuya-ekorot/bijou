import { Suspense } from 'react';

import Loading from '@/app/loading';
import CollectionList from '@/components/collections/CollectionList';
import { getCollections } from '@/lib/api/collections/queries';

import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function CollectionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Collections</h1>
        </div>
        <Collections />
      </div>
    </main>
  );
}

const Collections = async () => {
  await checkAuth();

  const { collections } = await getCollections();

  return (
    <Suspense fallback={<Loading />}>
      <CollectionList collections={collections} />
    </Suspense>
  );
};

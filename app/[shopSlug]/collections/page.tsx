import { Suspense } from "react";

import Loading from "@/app/loading";
import CollectionList from "@/components/collections/CollectionList";
import {
  getCollections,
  getCollectionsByShopId,
} from "@/lib/api/collections/queries";
import { getShopBySlug, getShops } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function CollectionsPage({
  params: { shopSlug },
}: {
  params: { shopSlug: string };
}) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Collections</h1>
        </div>
        <Collections shopSlug={shopSlug} />
      </div>
    </main>
  );
}

const Collections = async ({ shopSlug }: { shopSlug: string }) => {
  await checkAuth();

  const { shop } = await getShopBySlug(shopSlug);
  const { collections } = await getCollectionsByShopId(shop.id);

  return (
    <Suspense fallback={<Loading />}>
      <CollectionList collections={collections} shop={shop} />
    </Suspense>
  );
};

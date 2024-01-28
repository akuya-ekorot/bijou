import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCollectionById } from "@/lib/api/collections/queries";
import { getShopBySlug, getShops } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";
import OptimisticCollection from "./OptimisticCollection";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const revalidate = 0;

export default async function CollectionPage({
  params,
}: {
  params: { collectionId: string; shopSlug: string };
}) {
  return (
    <main className="overflow-auto">
      <Collection shopSlug={params.shopSlug} id={params.collectionId} />
    </main>
  );
}

const Collection = async ({
  id,
  shopSlug,
}: {
  id: string;
  shopSlug: string;
}) => {
  await checkAuth();

  const { collection } = await getCollectionById(id);
  const { shop } = await getShopBySlug(shopSlug);

  if (!collection) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/collections">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticCollection collection={collection.collection} shop={shop} />
      </div>
    </Suspense>
  );
};

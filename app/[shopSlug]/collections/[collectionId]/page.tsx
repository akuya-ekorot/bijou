import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCollectionById } from "@/lib/api/collections/queries";
import { getShops } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";
import OptimisticCollection from "./OptimisticCollection";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const revalidate = 0;

export default async function CollectionPage({
  params,
}: {
  params: { collectionId: string };
}) {
  return (
    <main className="overflow-auto">
      <Collection id={params.collectionId} />
    </main>
  );
}

const Collection = async ({ id }: { id: string }) => {
  await checkAuth();

  const { collection } = await getCollectionById(id);
  const { shops } = await getShops();

  if (!collection) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/collections">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticCollection
          collection={collection.collection}
          shops={shops}
        />
      </div>
    </Suspense>
  );
};

import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCollectionById } from "@/lib/api/collections/queries";
import OptimisticCollection from "./OptimisticCollection";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";


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
  

  if (!collection) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/collections">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticCollection collection={collection}  />
      </div>
    </Suspense>
  );
};

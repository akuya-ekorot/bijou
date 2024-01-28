import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getShopById } from "@/lib/api/shops/queries";
import OptimisticShop from "./OptimisticShop";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function ShopPage({
  params,
}: {
  params: { shopId: string };
}) {

  return (
    <main className="overflow-auto">
      <Shop id={params.shopId} />
    </main>
  );
}

const Shop = async ({ id }: { id: string }) => {
  await checkAuth();

  const { shop } = await getShopById(id);
  

  if (!shop) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/shops">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticShop shop={shop}  />
      </div>
    </Suspense>
  );
};

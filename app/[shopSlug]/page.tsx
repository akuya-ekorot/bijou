import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getShopBySlug } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";
import OptimisticShop from "../../components/shops/OptimisticShop";

import Loading from "@/app/loading";

export const revalidate = 0;

export default async function ShopPage({
  params,
}: {
  params: { shopSlug: string };
}) {
  return (
    <main className="overflow-auto">
      <Shop slug={params.shopSlug} />
    </main>
  );
}

const Shop = async ({ slug }: { slug: string }) => {
  await checkAuth();

  const { shop } = await getShopBySlug(slug);

  if (!shop) notFound();

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <OptimisticShop shop={shop} />
      </div>
    </Suspense>
  );
};

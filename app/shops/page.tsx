import { Suspense } from "react";

import Loading from "@/app/loading";
import ShopList from "@/components/shops/ShopList";
import { getShops } from "@/lib/api/shops/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ShopsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Shops</h1>
        </div>
        <Shops />
      </div>
    </main>
  );
}

const Shops = async () => {
  await checkAuth();

  const { shops } = await getShops();

  return (
    <Suspense fallback={<Loading />}>
      <ShopList shops={shops} />
    </Suspense>
  );
};

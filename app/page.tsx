import ShopList from "@/components/shops/ShopList";
import { getShops } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";
import { Suspense } from "react";
import Loading from "./loading";
import CreateShop from "@/components/shops/CreteShop";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ShopsPage() {
  await checkAuth();

  const { shops } = await getShops();
  const hasShops = shops.length > 0;

  return (
    <main>
      <div className="relative flex flex-col items-center pt-24">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">
            {hasShops ? "Pick shop" : "Create shops"}
          </h1>
        </div>
        <div className="w-full max-w-xl">
          {hasShops ? <Shops /> : <CreateShop />}
        </div>
      </div>
    </main>
  );
}

const Shops = async () => {
  const { shops } = await getShops();

  return (
    <Suspense fallback={<Loading />}>
      <ScrollArea className="pb-12 h-96">
        <ShopList shops={shops} />
      </ScrollArea>
    </Suspense>
  );
};

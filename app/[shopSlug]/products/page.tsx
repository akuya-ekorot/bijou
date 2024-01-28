import { Suspense } from "react";

import Loading from "@/app/loading";
import ProductList from "@/components/products/ProductList";
import { getProductsByShopId } from "@/lib/api/products/queries";
import { getShopBySlug } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ProductsPage({
  params: { shopSlug },
}: {
  params: { shopSlug: string };
}) {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Products</h1>
        </div>
        <Products shopSlug={shopSlug} />
      </div>
    </main>
  );
}

const Products = async ({ shopSlug }: { shopSlug: string }) => {
  await checkAuth();

  const { shop } = await getShopBySlug(shopSlug);
  const { products } = await getProductsByShopId(shop.id);

  return (
    <Suspense fallback={<Loading />}>
      <ProductList products={products} shop={shop} />
    </Suspense>
  );
};

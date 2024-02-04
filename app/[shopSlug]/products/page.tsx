import { Suspense } from "react";

import Loading from "@/app/loading";
import ProductList from "@/components/products/ProductList";
import { getProducts } from "@/lib/api/products/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ProductsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Products</h1>
        </div>
        <Products />
      </div>
    </main>
  );
}

const Products = async () => {
  await checkAuth();

  const { products } = await getProducts();
  
  return (
    <Suspense fallback={<Loading />}>
      <ProductList products={products}  />
    </Suspense>
  );
};

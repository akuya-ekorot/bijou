import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getProductById } from "@/lib/api/products/queries";
import { getShops } from "@/lib/api/shops/queries";import OptimisticProduct from "./OptimisticProduct";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: { productId: string };
}) {

  return (
    <main className="overflow-auto">
      <Product id={params.productId} />
    </main>
  );
}

const Product = async ({ id }: { id: string }) => {
  await checkAuth();

  const { product } = await getProductById(id);
  const { shops } = await getShops();

  if (!product) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/products">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticProduct product={product.product} shops={shops} />
      </div>
    </Suspense>
  );
};

import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductById } from "@/lib/api/products/queries";
import { getShopBySlug } from "@/lib/api/shops/queries";
import { checkAuth } from "@/lib/auth/utils";
import OptimisticProduct from "./OptimisticProduct";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: { productId: string; shopSlug: string };
}) {
  return (
    <main className="overflow-auto">
      <Product id={params.productId} shopSlug={params.shopSlug} />
    </main>
  );
}

const Product = async ({ id, shopSlug }: { id: string; shopSlug: string }) => {
  await checkAuth();

  const { product } = await getProductById(id);
  const { shop } = await getShopBySlug(shopSlug);

  if (!product) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/products">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticProduct product={product.product} shop={shop} />
      </div>
    </Suspense>
  );
};

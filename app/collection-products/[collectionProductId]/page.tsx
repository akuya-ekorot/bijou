import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCollectionProductById } from "@/lib/api/collectionProducts/queries";
import { getCollections } from "@/lib/api/collections/queries";
import { getProducts } from "@/lib/api/products/queries";
import { checkAuth } from "@/lib/auth/utils";
import OptimisticCollectionProduct from "./OptimisticCollectionProduct";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";

export const revalidate = 0;

export default async function CollectionProductPage({
  params,
}: {
  params: { collectionProductId: string };
}) {
  return (
    <main className="overflow-auto">
      <CollectionProduct id={params.collectionProductId} />
    </main>
  );
}

const CollectionProduct = async ({ id }: { id: string }) => {
  await checkAuth();

  const { collectionProduct } = await getCollectionProductById(id);
  const { collections } = await getCollections();
  const { products } = await getProducts();

  if (!collectionProduct) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/collection-products">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticCollectionProduct
          collectionProduct={collectionProduct.collectionProduct}
          collections={collections.map((collection) => collection.collection)}
          products={products.map((product) => product.product)}
        />
      </div>
    </Suspense>
  );
};

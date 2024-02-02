import { Suspense } from "react";

import Loading from "@/app/loading";
import CollectionProductList from "@/components/collectionProducts/CollectionProductList";
import { getCollectionProducts } from "@/lib/api/collectionProducts/queries";
import { getCollections } from "@/lib/api/collections/queries";
import { getProducts } from "@/lib/api/products/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function CollectionProductsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Collection Products</h1>
        </div>
        <CollectionProducts />
      </div>
    </main>
  );
}

const CollectionProducts = async () => {
  await checkAuth();

  const { collectionProducts } = await getCollectionProducts();
  const { collections } = await getCollections();
  const { products } = await getProducts();
  return (
    <Suspense fallback={<Loading />}>
      <CollectionProductList
        collectionProducts={collectionProducts}
        collections={collections.map((collection) => collection.collection)}
        products={products.map((product) => product.product)}
      />
    </Suspense>
  );
};

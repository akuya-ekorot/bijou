"use client";

import { TAddOptimistic } from "@/app/collection-products/useOptimisticCollectionProducts";
import { type CollectionProduct } from "@/lib/db/schema/collectionProducts";
import { cn } from "@/lib/utils";
import { useOptimistic, useState } from "react";

import CollectionProductForm from "@/components/collectionProducts/CollectionProductForm";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { type Collection } from "@/lib/db/schema/collections";
import { type Product } from "@/lib/db/schema/products";

export default function OptimisticCollectionProduct({
  collectionProduct,
  collections,
  products,
}: {
  collectionProduct: CollectionProduct;

  collections: Collection[];
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CollectionProduct) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticCollectionProduct, setOptimisticCollectionProduct] =
    useOptimistic(collectionProduct);
  const updateCollectionProduct: TAddOptimistic = (input) =>
    setOptimisticCollectionProduct({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <CollectionProductForm
          collectionProduct={collectionProduct}
          collections={collections}
          products={products}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateCollectionProduct}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {collectionProduct.collectionId}
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticCollectionProduct.id === "optimistic"
            ? "animate-pulse"
            : "",
        )}
      >
        {JSON.stringify(optimisticCollectionProduct, null, 2)}
      </pre>
    </div>
  );
}

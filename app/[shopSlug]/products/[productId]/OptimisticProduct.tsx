"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/[shopSlug]/products/useOptimisticProducts";
import { CompleteProduct } from "@/lib/db/schema/products";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import ProductForm from "@/components/products/ProductForm";
import { CompleteCollection } from "@/lib/db/schema/collections";

export default function OptimisticProduct({
  collections,
  product,
}: {
  collections: CompleteCollection[];
  product: CompleteProduct;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CompleteProduct) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticProduct, setOptimisticProduct] = useOptimistic(product);
  const updateProduct: TAddOptimistic = (input) =>
    setOptimisticProduct({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ProductForm
          collections={collections}
          product={product}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateProduct}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{product.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticProduct.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticProduct, null, 2)}
      </pre>
    </div>
  );
}

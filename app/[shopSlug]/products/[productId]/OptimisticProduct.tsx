"use client";

import { type Product } from "@/lib/db/schema/products";
import { cn } from "@/lib/utils";
import { useOptimistic, useState } from "react";

import ProductForm from "@/components/products/ProductForm";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { type Shop } from "@/lib/db/schema/shops";
import { TAddOptimistic } from "../useOptimisticProducts";

export default function OptimisticProduct({
  product,
  shop,
}: {
  product: Product;

  shop: Shop;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Product) => {
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
          product={product}
          shop={shop}
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

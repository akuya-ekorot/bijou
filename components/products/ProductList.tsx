"use client";

import Link from "next/link";
import { useState } from "react";

import { useOptimisticProducts } from "@/app/[shopSlug]/products/useOptimisticProducts";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { CompleteProduct, type Product } from "@/lib/db/schema/products";
import { type Shop } from "@/lib/db/schema/shops";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import ProductForm from "./ProductForm";

type TOpenModal = (product?: Product) => void;

export default function ProductList({
  products,
  shop,
}: {
  products: CompleteProduct[];
  shop: Shop;
}) {
  const { optimisticProducts, addOptimisticProduct } = useOptimisticProducts(
    products,
    shop,
  );
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const openModal = (product?: Product) => {
    setOpen(true);
    product ? setActiveProduct(product) : setActiveProduct(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeProduct ? "Edit Product" : "Create Products"}
      >
        <ProductForm
          product={activeProduct}
          addOptimistic={addOptimisticProduct}
          openModal={openModal}
          closeModal={closeModal}
          shop={shop}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticProducts.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticProducts.map((product) => (
            <Product
              product={product}
              key={product.product.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Product = ({
  product,
  openModal,
}: {
  product: CompleteProduct;
  openModal: TOpenModal;
}) => {
  const optimistic = product.product.id === "optimistic";
  const deleting = product.product.id === "delete";
  const mutating = optimistic || deleting;
  return (
    <li
      className={cn(
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{product.product.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/products/" + product.product.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No products
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new product.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Products{" "}
        </Button>
      </div>
    </div>
  );
};

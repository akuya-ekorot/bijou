"use client";

import Link from "next/link";
import { useState } from "react";

import { useOptimisticCollectionProducts } from "@/app/collection-products/useOptimisticCollectionProducts";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import {
  CompleteCollectionProduct,
  type CollectionProduct,
} from "@/lib/db/schema/collectionProducts";
import { type Collection } from "@/lib/db/schema/collections";
import { type Product } from "@/lib/db/schema/products";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import CollectionProductForm from "./CollectionProductForm";

type TOpenModal = (collectionProduct?: CollectionProduct) => void;

export default function CollectionProductList({
  collectionProducts,
  collections,
  products,
}: {
  collectionProducts: CompleteCollectionProduct[];
  collections: Collection[];
  products: Product[];
}) {
  const { optimisticCollectionProducts, addOptimisticCollectionProduct } =
    useOptimisticCollectionProducts(collectionProducts, collections, products);
  const [open, setOpen] = useState(false);
  const [activeCollectionProduct, setActiveCollectionProduct] =
    useState<CollectionProduct | null>(null);
  const openModal = (collectionProduct?: CollectionProduct) => {
    setOpen(true);
    collectionProduct
      ? setActiveCollectionProduct(collectionProduct)
      : setActiveCollectionProduct(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={
          activeCollectionProduct
            ? "Edit CollectionProduct"
            : "Create Collection Products"
        }
      >
        <CollectionProductForm
          collectionProduct={activeCollectionProduct}
          addOptimistic={addOptimisticCollectionProduct}
          openModal={openModal}
          closeModal={closeModal}
          collections={collections}
          products={products}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticCollectionProducts.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticCollectionProducts.map((collectionProduct) => (
            <CollectionProduct
              collectionProduct={collectionProduct}
              key={collectionProduct.collectionProduct.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const CollectionProduct = ({
  collectionProduct,
  openModal,
}: {
  collectionProduct: CompleteCollectionProduct;
  openModal: TOpenModal;
}) => {
  const optimistic = collectionProduct.collectionProduct.id === "optimistic";
  const deleting = collectionProduct.collectionProduct.id === "delete";
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
        <div>{collectionProduct.collectionProduct.collectionId}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link
          href={
            "/collection-products/" + collectionProduct.collectionProduct.id
          }
        >
          Edit
        </Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No collection products
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new collection product.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Collection Products{" "}
        </Button>
      </div>
    </div>
  );
};

"use client";

import { TAddOptimistic } from "@/app/[shopSlug]/collections/useOptimisticCollections";
import { type Collection } from "@/lib/db/schema/collections";
import { cn } from "@/lib/utils";
import { useOptimistic, useState } from "react";

import CollectionForm from "@/components/collections/CollectionForm";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import { type Shop } from "@/lib/db/schema/shops";

export default function OptimisticCollection({
  collection,
  shop,
}: {
  collection: Collection;
  shop: Shop;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Collection) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticCollection, setOptimisticCollection] =
    useOptimistic(collection);
  const updateCollection: TAddOptimistic = (input) =>
    setOptimisticCollection({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <CollectionForm
          collection={collection}
          shop={shop}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateCollection}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{collection.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticCollection.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticCollection, null, 2)}
      </pre>
    </div>
  );
}

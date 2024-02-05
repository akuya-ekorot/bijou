"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/[shopSlug]/collections/useOptimisticCollections";
import {
  CompleteCollection,
  type Collection,
} from "@/lib/db/schema/collections";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import CollectionForm from "@/components/collections/CollectionForm";

export default function OptimisticCollection({
  collection,
}: {
  collection: CompleteCollection;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CompleteCollection) => {
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

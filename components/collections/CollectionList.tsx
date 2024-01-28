"use client";

import Link from "next/link";
import { useState } from "react";

import { useOptimisticCollections } from "@/app/[shopSlug]/collections/useOptimisticCollections";
import Modal from "@/components/shared/Modal";
import { Button } from "@/components/ui/button";
import {
  CompleteCollection,
  type Collection,
} from "@/lib/db/schema/collections";
import { type Shop } from "@/lib/db/schema/shops";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import CollectionForm from "./CollectionForm";

type TOpenModal = (collection?: Collection) => void;

export default function CollectionList({
  collections,
  shop,
}: {
  collections: CompleteCollection[];
  shop: Shop;
}) {
  const { optimisticCollections, addOptimisticCollection } =
    useOptimisticCollections(collections, shop);
  const [open, setOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(
    null,
  );
  const openModal = (collection?: Collection) => {
    setOpen(true);
    collection ? setActiveCollection(collection) : setActiveCollection(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeCollection ? "Edit Collection" : "Create Collections"}
      >
        <CollectionForm
          collection={activeCollection}
          addOptimistic={addOptimisticCollection}
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
      {optimisticCollections.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticCollections.map((collection) => (
            <Collection
              collection={collection}
              key={collection.collection.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Collection = ({
  collection,
  openModal,
}: {
  collection: CompleteCollection;
  openModal: TOpenModal;
}) => {
  const optimistic = collection.collection.id === "optimistic";
  const deleting = collection.collection.id === "delete";
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
        <div>{collection.collection.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/collections/" + collection.collection.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No collections
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new collection.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Collections{" "}
        </Button>
      </div>
    </div>
  );
};

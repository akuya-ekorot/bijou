"use client";

import Link from "next/link";
import { useState } from "react";

import Modal from "@/components/shared/Modal";
import { CompleteShop, type Shop } from "@/lib/db/schema/shops";
import { cn } from "@/lib/utils";

import { useOptimisticShops } from "@/app/useOptimisticShops";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import ShopForm from "./ShopForm";

type TOpenModal = (shop?: Shop) => void;

export default function ShopList({ shops }: { shops: CompleteShop[] }) {
  const { optimisticShops, addOptimisticShop } = useOptimisticShops(shops);
  const [open, setOpen] = useState(false);
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const openModal = (shop?: Shop) => {
    setOpen(true);
    shop ? setActiveShop(shop) : setActiveShop(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeShop ? "Edit Shop" : "Create Shops"}
      >
        <ShopForm
          shop={activeShop}
          addOptimistic={addOptimisticShop}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>

      {!!shops.length && (
        <div className="absolute bottom-0 w-full flex justify-center">
          <Button onClick={() => openModal()} variant={"secondary"}>
            Create New Shop
          </Button>
        </div>
      )}

      {optimisticShops.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul className="p-4">
          {optimisticShops.map((shop) => (
            <Shop shop={shop} key={shop.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Shop = ({
  shop,
  openModal,
}: {
  shop: CompleteShop;
  openModal: TOpenModal;
}) => {
  const optimistic = shop.id === "optimistic";
  const deleting = shop.id === "delete";
  const mutating = optimistic || deleting;
  return (
    <li
      className={cn(
        "flex items-center border rounded-md p-2 justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full px-2">
        <div>{shop.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={`/${shop.slug}`}>Go</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No shops
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new shop.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Shops{" "}
        </Button>
      </div>
    </div>
  );
};

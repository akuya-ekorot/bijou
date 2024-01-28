"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { type Shop, CompleteShop } from "@/lib/db/schema/shops";
import Modal from "@/components/shared/Modal";

import { useOptimisticShops } from "@/app/shops/useOptimisticShops";
import { Button } from "@/components/ui/button";
import ShopForm from "./ShopForm";
import { PlusIcon } from "lucide-react";

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
        <div className="absolute right-0 top-0 ">
          <Button onClick={() => openModal()} variant={"outline"}>
            +
          </Button>
        </div>
      )}

      {optimisticShops.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
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
        "flex justify-between my-2",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <div>{shop.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/shops/" + shop.id}>Edit</Link>
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

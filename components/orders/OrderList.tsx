"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { type Order, CompleteOrder } from "@/lib/db/schema/orders";
import Modal from "@/components/shared/Modal";
import { type Customer } from "@/lib/db/schema/customers";
import { type Payment } from "@/lib/db/schema/payments";
import { useOptimisticOrders } from "@/app/orders/useOptimisticOrders";
import { Button } from "@/components/ui/button";
import OrderForm from "./OrderForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (order?: Order) => void;

export default function OrderList({
  orders,
  customers,
  payments,
}: {
  orders: CompleteOrder[];
  customers: Customer[];
  payments: Payment[];
}) {
  const { optimisticOrders, addOptimisticOrder } = useOptimisticOrders(
    orders,
    customers,
    payments,
  );
  const [open, setOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const openModal = (order?: Order) => {
    setOpen(true);
    order ? setActiveOrder(order) : setActiveOrder(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeOrder ? "Edit Order" : "Create Orders"}
      >
        <OrderForm
          order={activeOrder}
          addOptimistic={addOptimisticOrder}
          openModal={openModal}
          closeModal={closeModal}
          customers={customers}
          payments={payments}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticOrders.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticOrders.map((order) => (
            <Order order={order} key={order.order.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Order = ({
  order,
  openModal,
}: {
  order: CompleteOrder;
  openModal: TOpenModal;
}) => {
  const optimistic = order.order.id === "optimistic";
  const deleting = order.order.id === "delete";
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
        <div>{order.order.customerId}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/orders/" + order.order.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No orders
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new order.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Orders{" "}
        </Button>
      </div>
    </div>
  );
};

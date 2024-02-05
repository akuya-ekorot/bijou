"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/[shopSlug]/order-items/useOptimisticOrderItems";
import { type OrderItem } from "@/lib/db/schema/orderItems";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import OrderItemForm from "@/components/orderItems/OrderItemForm";
import { type Order } from "@/lib/db/schema/orders";
import { type Product } from "@/lib/db/schema/products";
import { type Shop } from "@/lib/db/schema/shops";

export default function OptimisticOrderItem({
  orderItem,
  orders,
  products,
  shops,
}: {
  orderItem: OrderItem;

  orders: Order[];
  products: Product[];
  shops: Shop[];
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: OrderItem) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticOrderItem, setOptimisticOrderItem] =
    useOptimistic(orderItem);
  const updateOrderItem: TAddOptimistic = (input) =>
    setOptimisticOrderItem({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <OrderItemForm
          orderItem={orderItem}
          orders={orders}
          products={products}
          shops={shops}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateOrderItem}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{orderItem.orderId}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticOrderItem.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticOrderItem, null, 2)}
      </pre>
    </div>
  );
}

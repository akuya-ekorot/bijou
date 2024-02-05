"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/[shopSlug]/payments/useOptimisticPayments";
import { type Payment } from "@/lib/db/schema/payments";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import PaymentForm from "@/components/payments/PaymentForm";

export default function OptimisticPayment({ payment }: { payment: Payment }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Payment) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticPayment, setOptimisticPayment] = useOptimistic(payment);
  const updatePayment: TAddOptimistic = (input) =>
    setOptimisticPayment({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <PaymentForm
          payment={payment}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updatePayment}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{payment.status}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticPayment.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticPayment, null, 2)}
      </pre>
    </div>
  );
}

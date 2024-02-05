"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { type Customer, CompleteCustomer } from "@/lib/db/schema/customers";
import Modal from "@/components/shared/Modal";

import { useOptimisticCustomers } from "@/app/[shopSlug]/customers/useOptimisticCustomers";
import { Button } from "@/components/ui/button";
import CustomerForm from "./CustomerForm";
import { PlusIcon } from "lucide-react";

type TOpenModal = (customer?: Customer) => void;

export default function CustomerList({
  customers,
}: {
  customers: CompleteCustomer[];
}) {
  const { optimisticCustomers, addOptimisticCustomer } =
    useOptimisticCustomers(customers);
  const [open, setOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const openModal = (customer?: Customer) => {
    setOpen(true);
    customer ? setActiveCustomer(customer) : setActiveCustomer(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeCustomer ? "Edit Customer" : "Create Customers"}
      >
        <CustomerForm
          customer={activeCustomer}
          addOptimistic={addOptimisticCustomer}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticCustomers.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticCustomers.map((customer) => (
            <Customer
              customer={customer}
              key={customer.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const Customer = ({
  customer,
  openModal,
}: {
  customer: CompleteCustomer;
  openModal: TOpenModal;
}) => {
  const optimistic = customer.id === "optimistic";
  const deleting = customer.id === "delete";
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
        <div>{customer.name}</div>
      </div>
      <Button variant={"link"} asChild>
        <Link href={"/customers/" + customer.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No customers
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new customer.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Customers{" "}
        </Button>
      </div>
    </div>
  );
};

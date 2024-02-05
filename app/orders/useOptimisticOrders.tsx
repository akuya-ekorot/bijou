import { type Customer } from "@/lib/db/schema/customers";
import { type Payment } from "@/lib/db/schema/payments";
import { type Order, type CompleteOrder } from "@/lib/db/schema/orders";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Order>) => void;

export const useOptimisticOrders = (
  orders: CompleteOrder[],
  customers: Customer[],
  payments: Payment[]
) => {
  const [optimisticOrders, addOptimisticOrder] = useOptimistic(
    orders,
    (
      currentState: CompleteOrder[],
      action: OptimisticAction<Order>,
    ): CompleteOrder[] => {
      const { data } = action;

      const optimisticCustomer = customers.find(
        (customer) => customer.id === data.customerId,
      )!;

      const optimisticPayment = payments.find(
        (payment) => payment.id === data.paymentId,
      )!;

      const optimisticOrder = {
        order: { ...data, id: "optimistic" },
        
        customer: optimisticCustomer,
       payment: optimisticPayment,
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticOrder]
            : [...currentState, optimisticOrder];
        case "update":
          return currentState.map((item) =>
            item.order.id === data.id ? { ...item, ...optimisticOrder } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.order.id === data.id
              ? { ...item, order: { ...item.order, id: "delete" } }
              : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticOrder, optimisticOrders };
};

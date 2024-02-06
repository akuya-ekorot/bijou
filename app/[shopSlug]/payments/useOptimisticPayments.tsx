import { type Payment, type CompletePayment } from '@/lib/db/schema/payments';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<Payment>) => void;

export const useOptimisticPayments = (payments: CompletePayment[]) => {
  const [optimisticPayments, addOptimisticPayment] = useOptimistic(
    payments,
    (
      currentState: CompletePayment[],
      action: OptimisticAction<Payment>,
    ): CompletePayment[] => {
      const { data } = action;

      const optimisticPayment = {
        ...data,

        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticPayment]
            : [...currentState, optimisticPayment];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticPayment } : item,
          );
        case 'delete':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: 'delete' } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticPayment, optimisticPayments };
};

import { type Shop, type CompleteShop } from '@/lib/db/schema/shops';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<Shop>) => void;

export const useOptimisticShops = (shops: CompleteShop[]) => {
  const [optimisticShops, addOptimisticShop] = useOptimistic(
    shops,
    (
      currentState: CompleteShop[],
      action: OptimisticAction<Shop>,
    ): CompleteShop[] => {
      const { data } = action;

      const optimisticShop = {
        ...data,

        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticShop]
            : [...currentState, optimisticShop];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticShop } : item,
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

  return { addOptimisticShop, optimisticShops };
};

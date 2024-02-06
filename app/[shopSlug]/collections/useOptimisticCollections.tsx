import {
  type Collection,
  type CompleteCollection,
} from '@/lib/db/schema/collections';
import { TImage } from '@/lib/db/schema/images';
import { Product } from '@/lib/db/schema/products';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (
  action: OptimisticAction<CompleteCollection>,
) => void;

export const useOptimisticCollections = (collections: CompleteCollection[]) => {
  const [optimisticCollections, addOptimisticCollection] = useOptimistic(
    collections,
    (
      currentState: CompleteCollection[],
      action: OptimisticAction<CompleteCollection>,
    ): CompleteCollection[] => {
      const { data } = action;

      const optimisticCollection = {
        ...data,
        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticCollection]
            : [...currentState, optimisticCollection];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticCollection } : item,
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

  return { addOptimisticCollection, optimisticCollections };
};

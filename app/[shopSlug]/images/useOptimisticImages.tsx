import { type TImage, type CompleteImage } from '@/lib/db/schema/images';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<TImage>) => void;

export const useOptimisticImages = (images: CompleteImage[]) => {
  const [optimisticImages, addOptimisticImage] = useOptimistic(
    images,
    (
      currentState: CompleteImage[],
      action: OptimisticAction<TImage>,
    ): CompleteImage[] => {
      const { data } = action;

      const optimisticImage = {
        ...data,

        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticImage]
            : [...currentState, optimisticImage];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticImage } : item,
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

  return { addOptimisticImage, optimisticImages };
};

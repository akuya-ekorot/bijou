import { type Hero, type CompleteHero } from '@/lib/db/schema/heroes';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<Hero>) => void;

export const useOptimisticHeroes = (heroes: CompleteHero[]) => {
  const [optimisticHeroes, addOptimisticHero] = useOptimistic(
    heroes,
    (
      currentState: CompleteHero[],
      action: OptimisticAction<Hero>,
    ): CompleteHero[] => {
      const { data } = action;

      const optimisticHero = {
        ...data,

        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticHero]
            : [...currentState, optimisticHero];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticHero } : item,
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

  return { addOptimisticHero, optimisticHeroes };
};

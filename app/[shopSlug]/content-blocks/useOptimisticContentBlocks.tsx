import { type Page } from '@/lib/db/schema/pages';
import {
  type ContentBlock,
  type CompleteContentBlock,
} from '@/lib/db/schema/contentBlocks';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<ContentBlock>) => void;

export const useOptimisticContentBlocks = (
  contentBlocks: CompleteContentBlock[],
  pages: Page[],
) => {
  const [optimisticContentBlocks, addOptimisticContentBlock] = useOptimistic(
    contentBlocks,
    (
      currentState: CompleteContentBlock[],
      action: OptimisticAction<ContentBlock>,
    ): CompleteContentBlock[] => {
      const { data } = action;

      const optimisticPage = pages.find((page) => page.id === data.pageId)!;

      const optimisticContentBlock = {
        ...data,
        page: optimisticPage,
        id: 'optimistic',
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticContentBlock]
            : [...currentState, optimisticContentBlock];
        case 'update':
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticContentBlock } : item,
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

  return { addOptimisticContentBlock, optimisticContentBlocks };
};

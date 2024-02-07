import { type Product } from '@/lib/db/schema/products';
import { type ContentBlock } from '@/lib/db/schema/contentBlocks';
import {
  type ContentBlockProduct,
  type CompleteContentBlockProduct,
} from '@/lib/db/schema/contentBlockProducts';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (
  action: OptimisticAction<ContentBlockProduct>,
) => void;

export const useOptimisticContentBlockProducts = (
  contentBlockProducts: CompleteContentBlockProduct[],
  products: Product[],
  contentBlocks: ContentBlock[],
) => {
  const [optimisticContentBlockProducts, addOptimisticContentBlockProduct] =
    useOptimistic(
      contentBlockProducts,
      (
        currentState: CompleteContentBlockProduct[],
        action: OptimisticAction<ContentBlockProduct>,
      ): CompleteContentBlockProduct[] => {
        const { data } = action;

        const optimisticProduct = products.find(
          (product) => product.id === data.productId,
        )!;

        const optimisticContentBlock = contentBlocks.find(
          (contentBlock) => contentBlock.id === data.contentBlockId,
        )!;

        const optimisticContentBlockProduct = {
          ...data,
          product: optimisticProduct,
          contentBlock: optimisticContentBlock,
          id: 'optimistic',
        };

        switch (action.action) {
          case 'create':
            return currentState.length === 0
              ? [optimisticContentBlockProduct]
              : [...currentState, optimisticContentBlockProduct];
          case 'update':
            return currentState.map((item) =>
              item.id === data.id
                ? { ...item, ...optimisticContentBlockProduct }
                : item,
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

  return { addOptimisticContentBlockProduct, optimisticContentBlockProducts };
};

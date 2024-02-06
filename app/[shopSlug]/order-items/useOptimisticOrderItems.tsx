import { type Order } from '@/lib/db/schema/orders';
import { type Product } from '@/lib/db/schema/products';
import { type Shop } from '@/lib/db/schema/shops';
import {
  type OrderItem,
  type CompleteOrderItem,
} from '@/lib/db/schema/orderItems';
import { OptimisticAction } from '@/lib/utils';
import { useOptimistic } from 'react';

export type TAddOptimistic = (action: OptimisticAction<OrderItem>) => void;

export const useOptimisticOrderItems = (
  orderItems: CompleteOrderItem[],
  orders: Order[],
  products: Product[],
  shops: Shop[],
) => {
  const [optimisticOrderItems, addOptimisticOrderItem] = useOptimistic(
    orderItems,
    (
      currentState: CompleteOrderItem[],
      action: OptimisticAction<OrderItem>,
    ): CompleteOrderItem[] => {
      const { data } = action;

      const optimisticOrder = orders.find(
        (order) => order.id === data.orderId,
      )!;

      const optimisticProduct = products.find(
        (product) => product.id === data.productId,
      )!;

      const optimisticShop = shops.find((shop) => shop.id === data.shopId)!;

      const optimisticOrderItem = {
        orderItem: { ...data, id: 'optimistic' },

        order: optimisticOrder,
        product: optimisticProduct,
        shop: optimisticShop,
      };

      switch (action.action) {
        case 'create':
          return currentState.length === 0
            ? [optimisticOrderItem]
            : [...currentState, optimisticOrderItem];
        case 'update':
          return currentState.map((item) =>
            item.orderItem.id === data.id
              ? { ...item, ...optimisticOrderItem }
              : item,
          );
        case 'delete':
          return currentState.map((item) =>
            item.orderItem.id === data.id
              ? { ...item, orderItem: { ...item.orderItem, id: 'delete' } }
              : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticOrderItem, optimisticOrderItems };
};

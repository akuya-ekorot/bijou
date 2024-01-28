import { type Shop } from "@/lib/db/schema/shops";
import { type Product, type CompleteProduct } from "@/lib/db/schema/products";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Product>) => void;

export const useOptimisticProducts = (
  products: CompleteProduct[],
  shops: Shop[]
) => {
  const [optimisticProducts, addOptimisticProduct] = useOptimistic(
    products,
    (
      currentState: CompleteProduct[],
      action: OptimisticAction<Product>,
    ): CompleteProduct[] => {
      const { data } = action;

      const optimisticShop = shops.find(
        (shop) => shop.id === data.shopId,
      )!;

      const optimisticProduct = {
        product: { ...data, id: "optimistic" },
        
        shop: optimisticShop,
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticProduct]
            : [...currentState, optimisticProduct];
        case "update":
          return currentState.map((item) =>
            item.product.id === data.id ? { ...item, ...optimisticProduct } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.product.id === data.id
              ? { ...item, product: { ...item.product, id: "delete" } }
              : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticProduct, optimisticProducts };
};

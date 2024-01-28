import {
  type Collection,
  type CompleteCollection,
} from "@/lib/db/schema/collections";
import { type Shop } from "@/lib/db/schema/shops";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<Collection>) => void;

export const useOptimisticCollections = (
  collections: CompleteCollection[],
  shop: Shop,
) => {
  const [optimisticCollections, addOptimisticCollection] = useOptimistic(
    collections,
    (
      currentState: CompleteCollection[],
      action: OptimisticAction<Collection>,
    ): CompleteCollection[] => {
      const { data } = action;

      const optimisticShop = shop;

      const optimisticCollection = {
        collection: { ...data, id: "optimistic" },

        shop: optimisticShop,
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticCollection]
            : [...currentState, optimisticCollection];
        case "update":
          return currentState.map((item) =>
            item.collection.id === data.id
              ? { ...item, ...optimisticCollection }
              : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.collection.id === data.id
              ? { ...item, collection: { ...item.collection, id: "delete" } }
              : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticCollection, optimisticCollections };
};

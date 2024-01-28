import {
  type CollectionProduct,
  type CompleteCollectionProduct,
} from "@/lib/db/schema/collectionProducts";
import { type Collection } from "@/lib/db/schema/collections";
import { type Product } from "@/lib/db/schema/products";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (
  action: OptimisticAction<CollectionProduct>,
) => void;

export const useOptimisticCollectionProducts = (
  collectionProducts: CompleteCollectionProduct[],
  collections: Collection[],
  products: Product[],
) => {
  const [optimisticCollectionProducts, addOptimisticCollectionProduct] =
    useOptimistic(
      collectionProducts,
      (
        currentState: CompleteCollectionProduct[],
        action: OptimisticAction<CollectionProduct>,
      ): CompleteCollectionProduct[] => {
        const { data } = action;

        const optimisticCollection = collections.find(
          (collection) => collection.id === data.collectionId,
        )!;

        const optimisticProduct = products.find(
          (product) => product.id === data.productId,
        )!;

        const optimisticCollectionProduct = {
          collectionProduct: { ...data, id: "optimistic" },

          collection: optimisticCollection,
          product: optimisticProduct,
        };

        switch (action.action) {
          case "create":
            return currentState.length === 0
              ? [optimisticCollectionProduct]
              : [...currentState, optimisticCollectionProduct];
          case "update":
            return currentState.map((item) =>
              item.collectionProduct.id === data.id
                ? { ...item, ...optimisticCollectionProduct }
                : item,
            );
          case "delete":
            return currentState.map((item) =>
              item.collectionProduct.id === data.id
                ? {
                    ...item,
                    collectionProduct: {
                      ...item.collectionProduct,
                      id: "delete",
                    },
                  }
                : item,
            );
          default:
            return currentState;
        }
      },
    );

  return { addOptimisticCollectionProduct, optimisticCollectionProducts };
};

import { type Collection } from "@/lib/db/schema/collections";
import { type ContentBlock } from "@/lib/db/schema/contentBlocks";
import { type ContentBlockCollection, type CompleteContentBlockCollection } from "@/lib/db/schema/contentBlockCollections";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<ContentBlockCollection>) => void;

export const useOptimisticContentBlockCollections = (
  contentBlockCollections: CompleteContentBlockCollection[],
  collections: Collection[],
  contentBlocks: ContentBlock[]
) => {
  const [optimisticContentBlockCollections, addOptimisticContentBlockCollection] = useOptimistic(
    contentBlockCollections,
    (
      currentState: CompleteContentBlockCollection[],
      action: OptimisticAction<ContentBlockCollection>,
    ): CompleteContentBlockCollection[] => {
      const { data } = action;

      const optimisticCollection = collections.find(
        (collection) => collection.id === data.collectionId,
      )!;

      const optimisticContentBlock = contentBlocks.find(
        (contentBlock) => contentBlock.id === data.contentBlockId,
      )!;

      const optimisticContentBlockCollection = {
        ...data,
        collection: optimisticCollection,
       contentBlock: optimisticContentBlock,
        id: "optimistic",
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0
            ? [optimisticContentBlockCollection]
            : [...currentState, optimisticContentBlockCollection];
        case "update":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, ...optimisticContentBlockCollection } : item,
          );
        case "delete":
          return currentState.map((item) =>
            item.id === data.id ? { ...item, id: "delete" } : item,
          );
        default:
          return currentState;
      }
    },
  );

  return { addOptimisticContentBlockCollection, optimisticContentBlockCollections };
};

'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/content-block-collections/useOptimisticContentBlockCollections';
import { type ContentBlockCollection } from '@/lib/db/schema/contentBlockCollections';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import ContentBlockCollectionForm from '@/components/contentBlockCollections/ContentBlockCollectionForm';
import {
  type Collection,
  type CollectionId,
} from '@/lib/db/schema/collections';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';

export default function OptimisticContentBlockCollection({
  contentBlockCollection,
  collections,
  collectionId,
  contentBlocks,
  contentBlockId,
}: {
  contentBlockCollection: ContentBlockCollection;

  collections: Collection[];
  collectionId?: CollectionId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: ContentBlockCollection) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [
    optimisticContentBlockCollection,
    setOptimisticContentBlockCollection,
  ] = useOptimistic(contentBlockCollection);
  const updateContentBlockCollection: TAddOptimistic = (input) =>
    setOptimisticContentBlockCollection({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ContentBlockCollectionForm
          contentBlockCollection={contentBlockCollection}
          collections={collections}
          collectionId={collectionId}
          contentBlocks={contentBlocks}
          contentBlockId={contentBlockId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateContentBlockCollection}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {contentBlockCollection.collectionId}
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticContentBlockCollection.id === 'optimistic'
            ? 'animate-pulse'
            : '',
        )}
      >
        {JSON.stringify(optimisticContentBlockCollection, null, 2)}
      </pre>
    </div>
  );
}

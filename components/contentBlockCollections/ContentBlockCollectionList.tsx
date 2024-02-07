'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  type ContentBlockCollection,
  CompleteContentBlockCollection,
} from '@/lib/db/schema/contentBlockCollections';
import Modal from '@/components/shared/Modal';
import {
  type Collection,
  type CollectionId,
} from '@/lib/db/schema/collections';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';
import { useOptimisticContentBlockCollections } from '@/app/[shopSlug]/content-block-collections/useOptimisticContentBlockCollections';
import { Button } from '@/components/ui/button';
import ContentBlockCollectionForm from './ContentBlockCollectionForm';
import { PlusIcon } from 'lucide-react';

type TOpenModal = (contentBlockCollection?: ContentBlockCollection) => void;

export default function ContentBlockCollectionList({
  contentBlockCollections,
  collections,
  collectionId,
  contentBlocks,
  contentBlockId,
}: {
  contentBlockCollections: CompleteContentBlockCollection[];
  collections: Collection[];
  collectionId?: CollectionId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
}) {
  const {
    optimisticContentBlockCollections,
    addOptimisticContentBlockCollection,
  } = useOptimisticContentBlockCollections(
    contentBlockCollections,
    collections,
    contentBlocks,
  );
  const [open, setOpen] = useState(false);
  const [activeContentBlockCollection, setActiveContentBlockCollection] =
    useState<ContentBlockCollection | null>(null);
  const openModal = (contentBlockCollection?: ContentBlockCollection) => {
    setOpen(true);
    contentBlockCollection
      ? setActiveContentBlockCollection(contentBlockCollection)
      : setActiveContentBlockCollection(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={
          activeContentBlockCollection
            ? 'Edit ContentBlockCollection'
            : 'Create Content Block Collection'
        }
      >
        <ContentBlockCollectionForm
          contentBlockCollection={activeContentBlockCollection}
          addOptimistic={addOptimisticContentBlockCollection}
          openModal={openModal}
          closeModal={closeModal}
          collections={collections}
          collectionId={collectionId}
          contentBlocks={contentBlocks}
          contentBlockId={contentBlockId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticContentBlockCollections.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticContentBlockCollections.map((contentBlockCollection) => (
            <ContentBlockCollection
              contentBlockCollection={contentBlockCollection}
              key={contentBlockCollection.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const ContentBlockCollection = ({
  contentBlockCollection,
  openModal,
}: {
  contentBlockCollection: CompleteContentBlockCollection;
  openModal: TOpenModal;
}) => {
  const optimistic = contentBlockCollection.id === 'optimistic';
  const deleting = contentBlockCollection.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('content-block-collections')
    ? pathname
    : pathname + '/content-block-collections/';

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : '',
      )}
    >
      <div className="w-full">
        <div>{contentBlockCollection.collectionId}</div>
      </div>
      <Button variant={'link'} asChild>
        <Link href={basePath + '/' + contentBlockCollection.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No content block collections
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new content block collection.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Content Block Collections{' '}
        </Button>
      </div>
    </div>
  );
};

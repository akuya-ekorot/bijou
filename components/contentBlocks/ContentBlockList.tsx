'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  type ContentBlock,
  CompleteContentBlock,
} from '@/lib/db/schema/contentBlocks';
import Modal from '@/components/shared/Modal';
import { type Page, type PageId } from '@/lib/db/schema/pages';
import { useOptimisticContentBlocks } from '@/app/[shopSlug]/content-blocks/useOptimisticContentBlocks';
import { Button } from '@/components/ui/button';
import ContentBlockForm from './ContentBlockForm';
import { PlusIcon } from 'lucide-react';

type TOpenModal = (contentBlock?: ContentBlock) => void;

export default function ContentBlockList({
  contentBlocks,
  pages,
  pageId,
}: {
  contentBlocks: CompleteContentBlock[];
  pages: Page[];
  pageId?: PageId;
}) {
  const { optimisticContentBlocks, addOptimisticContentBlock } =
    useOptimisticContentBlocks(contentBlocks, pages);
  const [open, setOpen] = useState(false);
  const [activeContentBlock, setActiveContentBlock] =
    useState<ContentBlock | null>(null);
  const openModal = (contentBlock?: ContentBlock) => {
    setOpen(true);
    contentBlock
      ? setActiveContentBlock(contentBlock)
      : setActiveContentBlock(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={
          activeContentBlock ? 'Edit ContentBlock' : 'Create Content Block'
        }
      >
        <ContentBlockForm
          contentBlock={activeContentBlock}
          addOptimistic={addOptimisticContentBlock}
          openModal={openModal}
          closeModal={closeModal}
          pages={pages}
          pageId={pageId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticContentBlocks.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticContentBlocks.map((contentBlock) => (
            <ContentBlock
              contentBlock={contentBlock}
              key={contentBlock.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const ContentBlock = ({
  contentBlock,
  openModal,
}: {
  contentBlock: CompleteContentBlock;
  openModal: TOpenModal;
}) => {
  const optimistic = contentBlock.id === 'optimistic';
  const deleting = contentBlock.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('content-blocks')
    ? pathname
    : pathname + '/content-blocks/';

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : '',
      )}
    >
      <div className="w-full">
        <div>{contentBlock.title}</div>
      </div>
      <Button variant={'link'} asChild>
        <Link href={basePath + '/' + contentBlock.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No content blocks
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new content block.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Content Blocks{' '}
        </Button>
      </div>
    </div>
  );
};

'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/content-blocks/useOptimisticContentBlocks';
import { type ContentBlock } from '@/lib/db/schema/contentBlocks';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import ContentBlockForm from '@/components/contentBlocks/ContentBlockForm';
import { type Page, type PageId } from '@/lib/db/schema/pages';

export default function OptimisticContentBlock({
  contentBlock,
  pages,
  pageId,
}: {
  contentBlock: ContentBlock;

  pages: Page[];
  pageId?: PageId;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: ContentBlock) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticContentBlock, setOptimisticContentBlock] =
    useOptimistic(contentBlock);
  const updateContentBlock: TAddOptimistic = (input) =>
    setOptimisticContentBlock({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ContentBlockForm
          contentBlock={contentBlock}
          pages={pages}
          pageId={pageId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateContentBlock}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{contentBlock.title}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticContentBlock.id === 'optimistic' ? 'animate-pulse' : '',
        )}
      >
        {JSON.stringify(optimisticContentBlock, null, 2)}
      </pre>
    </div>
  );
}

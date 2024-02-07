'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/content-block-products/useOptimisticContentBlockProducts';
import { type ContentBlockProduct } from '@/lib/db/schema/contentBlockProducts';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import ContentBlockProductForm from '@/components/contentBlockProducts/ContentBlockProductForm';
import { type Product, type ProductId } from '@/lib/db/schema/products';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';

export default function OptimisticContentBlockProduct({
  contentBlockProduct,
  products,
  productId,
  contentBlocks,
  contentBlockId,
}: {
  contentBlockProduct: ContentBlockProduct;

  products: Product[];
  productId?: ProductId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: ContentBlockProduct) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticContentBlockProduct, setOptimisticContentBlockProduct] =
    useOptimistic(contentBlockProduct);
  const updateContentBlockProduct: TAddOptimistic = (input) =>
    setOptimisticContentBlockProduct({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ContentBlockProductForm
          contentBlockProduct={contentBlockProduct}
          products={products}
          productId={productId}
          contentBlocks={contentBlocks}
          contentBlockId={contentBlockId}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateContentBlockProduct}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">
          {contentBlockProduct.productId}
        </h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticContentBlockProduct.id === 'optimistic'
            ? 'animate-pulse'
            : '',
        )}
      >
        {JSON.stringify(optimisticContentBlockProduct, null, 2)}
      </pre>
    </div>
  );
}

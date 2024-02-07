'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import {
  type ContentBlockProduct,
  CompleteContentBlockProduct,
} from '@/lib/db/schema/contentBlockProducts';
import Modal from '@/components/shared/Modal';
import { type Product, type ProductId } from '@/lib/db/schema/products';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';
import { useOptimisticContentBlockProducts } from '@/app/[shopSlug]/content-block-products/useOptimisticContentBlockProducts';
import { Button } from '@/components/ui/button';
import ContentBlockProductForm from './ContentBlockProductForm';
import { PlusIcon } from 'lucide-react';

type TOpenModal = (contentBlockProduct?: ContentBlockProduct) => void;

export default function ContentBlockProductList({
  contentBlockProducts,
  products,
  productId,
  contentBlocks,
  contentBlockId,
}: {
  contentBlockProducts: CompleteContentBlockProduct[];
  products: Product[];
  productId?: ProductId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
}) {
  const { optimisticContentBlockProducts, addOptimisticContentBlockProduct } =
    useOptimisticContentBlockProducts(
      contentBlockProducts,
      products,
      contentBlocks,
    );
  const [open, setOpen] = useState(false);
  const [activeContentBlockProduct, setActiveContentBlockProduct] =
    useState<ContentBlockProduct | null>(null);
  const openModal = (contentBlockProduct?: ContentBlockProduct) => {
    setOpen(true);
    contentBlockProduct
      ? setActiveContentBlockProduct(contentBlockProduct)
      : setActiveContentBlockProduct(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={
          activeContentBlockProduct
            ? 'Edit ContentBlockProduct'
            : 'Create Content Block Product'
        }
      >
        <ContentBlockProductForm
          contentBlockProduct={activeContentBlockProduct}
          addOptimistic={addOptimisticContentBlockProduct}
          openModal={openModal}
          closeModal={closeModal}
          products={products}
          productId={productId}
          contentBlocks={contentBlocks}
          contentBlockId={contentBlockId}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticContentBlockProducts.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticContentBlockProducts.map((contentBlockProduct) => (
            <ContentBlockProduct
              contentBlockProduct={contentBlockProduct}
              key={contentBlockProduct.id}
              openModal={openModal}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

const ContentBlockProduct = ({
  contentBlockProduct,
  openModal,
}: {
  contentBlockProduct: CompleteContentBlockProduct;
  openModal: TOpenModal;
}) => {
  const optimistic = contentBlockProduct.id === 'optimistic';
  const deleting = contentBlockProduct.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('content-block-products')
    ? pathname
    : pathname + '/content-block-products/';

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : '',
      )}
    >
      <div className="w-full">
        <div>{contentBlockProduct.productId}</div>
      </div>
      <Button variant={'link'} asChild>
        <Link href={basePath + '/' + contentBlockProduct.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No content block products
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new content block product.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Content Block Products{' '}
        </Button>
      </div>
    </div>
  );
};

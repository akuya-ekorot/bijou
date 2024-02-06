'use client';

import { useState } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { type Product, CompleteProduct } from '@/lib/db/schema/products';
import Modal from '@/components/shared/Modal';

import { useOptimisticProducts } from '@/app/[shopSlug]/products/useOptimisticProducts';
import { Button } from '@/components/ui/button';
import ProductForm from './ProductForm';
import { PlusIcon } from 'lucide-react';
import { DataTable } from '../shared/data-table';
import { columns } from './columns';
import { CompleteCollection } from '@/lib/db/schema/collections';

type TOpenModal = (product?: CompleteProduct) => void;

export default function ProductList({
  collections,
  products,
}: {
  collections: Array<CompleteCollection>;
  products: CompleteProduct[];
}) {
  const { optimisticProducts, addOptimisticProduct } =
    useOptimisticProducts(products);
  const [open, setOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<CompleteProduct | null>(
    null,
  );
  const openModal = (product?: CompleteProduct) => {
    setOpen(true);
    product ? setActiveProduct(product) : setActiveProduct(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeProduct ? 'Edit Product' : 'Create Products'}
      >
        <ProductForm
          collections={collections}
          product={activeProduct}
          addOptimistic={addOptimisticProduct}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticProducts.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <DataTable columns={columns} data={optimisticProducts} />
      )}
    </div>
  );
}

const Product = ({
  product,
  openModal,
}: {
  product: CompleteProduct;
  openModal: TOpenModal;
}) => {
  const optimistic = product.id === 'optimistic';
  const deleting = product.id === 'delete';
  const mutating = optimistic || deleting;
  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : '',
      )}
    >
      <div className="w-full">
        <div>{product.name}</div>
      </div>
      <Button variant={'link'} asChild>
        <Link href={'/products/' + product.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No products
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new product.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Products{' '}
        </Button>
      </div>
    </div>
  );
};

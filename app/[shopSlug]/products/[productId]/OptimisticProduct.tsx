'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/products/useOptimisticProducts';
import { CompleteProduct } from '@/lib/db/schema/products';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import ProductForm from '@/components/products/ProductForm';
import { CompleteCollection } from '@/lib/db/schema/collections';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function OptimisticProduct({
  collections,
  product,
}: {
  collections: CompleteCollection[];
  product: CompleteProduct;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CompleteProduct) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticProduct, setOptimisticProduct] = useOptimistic(product);
  const updateProduct: TAddOptimistic = (input) =>
    setOptimisticProduct({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ProductForm
          collections={collections}
          product={product}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateProduct}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{product.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <div
        className={cn(
          'p-4 rounded-lg',
          optimisticProduct.id === 'optimistic' ? 'animate-pulse' : '',
        )}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground">
            <h2 className="text-sm font-medium underline">Slug</h2>
            <p>{optimisticProduct.slug}</p>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground">
            <h2 className="text-sm font-medium underline">Price</h2>
            <p>
              {new Intl.NumberFormat('en-KE', {
                style: 'currency',
                currency: 'KES',
              }).format(optimisticProduct.price ?? 0)}
            </p>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground col-span-full">
            <h2 className="text-sm font-medium underline">Description</h2>
            <p>{optimisticProduct.description}</p>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground col-span-full">
            <h2 className="text-sm font-medium underline">Images</h2>
            <div className="flex flex-wrap items-center gap-4">
              {optimisticProduct.images.length > 0 ? (
                optimisticProduct.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={product.name}
                    height={180}
                    width={180}
                  />
                ))
              ) : (
                <div className="w-full flex items-center justify-center p-4">
                  No Images
                </div>
              )}
            </div>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground col-span-full">
            <h2 className="text-sm font-medium underline">Collections</h2>
            <div className="flex flex-wrap items-center gap-4">
              {optimisticProduct.collections.length > 0 ? (
                optimisticProduct.collections.map((collection) => (
                  <Link
                    href={`../collections/${collection.id}`}
                    key={collection.id}
                  >
                    <Badge>{collection.name}</Badge>
                  </Link>
                ))
              ) : (
                <div className="w-full flex items-center justify-center p-4">
                  No Collections
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

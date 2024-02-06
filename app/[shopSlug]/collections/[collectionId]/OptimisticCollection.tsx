'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/collections/useOptimisticCollections';
import { CompleteCollection } from '@/lib/db/schema/collections';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import CollectionForm from '@/components/collections/CollectionForm';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function OptimisticCollection({
  collection,
}: {
  collection: CompleteCollection;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: CompleteCollection) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticCollection, setOptimisticCollection] =
    useOptimistic(collection);
  const updateCollection: TAddOptimistic = (input) =>
    setOptimisticCollection({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <CollectionForm
          collection={collection}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateCollection}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{collection.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <div
        className={cn(
          'p-4 rounded-lg',
          optimisticCollection.id === 'optimistic' ? 'animate-pulse' : '',
        )}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground">
            <h2 className="text-sm font-medium underline">Slug</h2>
            <p>{optimisticCollection.slug}</p>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground col-span-full">
            <h2 className="text-sm font-medium underline">Description</h2>
            <p>{optimisticCollection.description}</p>
          </div>

          <div className="bg-secondary rounded p-4 space-y-2 text-secondary-foreground col-span-full">
            <h2 className="text-sm font-medium underline">Images</h2>
            <div className="flex flex-wrap items-center gap-4">
              {optimisticCollection.images.length > 0 ? (
                optimisticCollection.images.map((image) => (
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={collection.name}
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
            <h2 className="text-sm font-medium underline">Products</h2>
            <div className="flex flex-wrap items-center gap-4">
              {optimisticCollection.products.length > 0 ? (
                optimisticCollection.products.map((product) => (
                  <Link href={`../products/${product.id}`} key={product.id}>
                    <Badge>{product.name}</Badge>
                  </Link>
                ))
              ) : (
                <div className="w-full flex items-center justify-center p-4">
                  No Products
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { type Shop } from '@/lib/db/schema/shops';
import { cn } from '@/lib/utils';
import { useOptimistic, useState } from 'react';

import Modal from '@/components/shared/Modal';
import ShopForm from '@/components/shops/ShopForm';
import { Button } from '@/components/ui/button';
import { TAddOptimistic } from '../../lib/hooks/useOptimisticShops';

export default function OptimisticShop({ shop }: { shop: Shop }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Shop) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticShop, setOptimisticShop] = useOptimistic(shop);
  const updateShop: TAddOptimistic = (input) =>
    setOptimisticShop({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ShopForm
          shop={shop}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateShop}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{shop.name}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticShop.id === 'optimistic' ? 'animate-pulse' : '',
        )}
      >
        {JSON.stringify(optimisticShop, null, 2)}
      </pre>
    </div>
  );
}

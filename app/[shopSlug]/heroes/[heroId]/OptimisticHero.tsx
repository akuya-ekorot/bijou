'use client';

import { useOptimistic, useState } from 'react';
import { TAddOptimistic } from '@/app/[shopSlug]/heroes/useOptimisticHeroes';
import { type Hero } from '@/lib/db/schema/heroes';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import Modal from '@/components/shared/Modal';
import HeroForm from '@/components/heroes/HeroForm';

export default function OptimisticHero({
  hero,
  shopId,
}: {
  hero: Hero;
  shopId: string;
}) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: Hero) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticHero, setOptimisticHero] = useOptimistic(hero);
  const updateHero: TAddOptimistic = (input) =>
    setOptimisticHero({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <HeroForm
          shopId={shopId}
          hero={hero}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateHero}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{hero.title}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          'bg-secondary p-4 rounded-lg break-all text-wrap',
          optimisticHero.id === 'optimistic' ? 'animate-pulse' : '',
        )}
      >
        {JSON.stringify(optimisticHero, null, 2)}
      </pre>
    </div>
  );
}

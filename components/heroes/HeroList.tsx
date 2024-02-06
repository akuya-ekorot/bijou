'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { type Hero, CompleteHero } from '@/lib/db/schema/heroes';
import Modal from '@/components/shared/Modal';

import { useOptimisticHeroes } from '@/app/[shopSlug]/heroes/useOptimisticHeroes';
import { Button } from '@/components/ui/button';
import HeroForm from './HeroForm';
import { PlusIcon } from 'lucide-react';

type TOpenModal = (hero?: Hero) => void;

export default function HeroList({
  heroes,
  shopId,
}: {
  heroes: CompleteHero[];
  shopId: string;
}) {
  const { optimisticHeroes, addOptimisticHero } = useOptimisticHeroes(heroes);
  const [open, setOpen] = useState(false);
  const [activeHero, setActiveHero] = useState<Hero | null>(null);
  const openModal = (hero?: Hero) => {
    setOpen(true);
    hero ? setActiveHero(hero) : setActiveHero(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeHero ? 'Edit Hero' : 'Create Hero'}
      >
        <HeroForm
          shopId={shopId}
          hero={activeHero}
          addOptimistic={addOptimisticHero}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={'outline'}>
          +
        </Button>
      </div>
      {optimisticHeroes.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          {optimisticHeroes.map((hero) => (
            <Hero hero={hero} key={hero.id} openModal={openModal} />
          ))}
        </ul>
      )}
    </div>
  );
}

const Hero = ({
  hero,
  openModal,
}: {
  hero: CompleteHero;
  openModal: TOpenModal;
}) => {
  const optimistic = hero.id === 'optimistic';
  const deleting = hero.id === 'delete';
  const mutating = optimistic || deleting;
  const pathname = usePathname();
  const basePath = pathname.includes('heroes')
    ? pathname
    : pathname + '/heroes/';

  return (
    <li
      className={cn(
        'flex justify-between my-2',
        mutating ? 'opacity-30 animate-pulse' : '',
        deleting ? 'text-destructive' : '',
      )}
    >
      <div className="w-full">
        <div>{hero.title}</div>
      </div>
      <Button variant={'link'} asChild>
        <Link href={basePath + '/' + hero.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No heroes
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new hero.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Heroes{' '}
        </Button>
      </div>
    </div>
  );
};

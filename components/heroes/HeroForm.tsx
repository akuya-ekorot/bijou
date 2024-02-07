import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/heroes/useOptimisticHeroes';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';

import { type Hero, insertHeroParams } from '@/lib/db/schema/heroes';
import {
  createHeroAction,
  deleteHeroAction,
  updateHeroAction,
} from '@/lib/actions/heroes';

const HeroForm = ({
  shopId,
  hero,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  hero?: Hero | null;
  shopId: string;
  openModal?: (hero?: Hero) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Hero>(insertHeroParams);
  const { toast } = useToast();
  const editing = !!hero?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('heroes');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Hero },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
    } else {
      router.refresh();
      postSuccess && postSuccess();
    }

    toast({
      title: failed ? `Failed to ${action}` : 'Success',
      description: failed ? data?.error ?? 'Error' : `Hero ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  console.error(errors);

  const handleSubmit = async (
    { shopId }: { shopId: string },
    data: FormData,
  ) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const heroParsed = await insertHeroParams.safeParseAsync({
      ...payload,
      shopId,
    });
    if (!heroParsed.success) {
      setErrors(heroParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = heroParsed.data;
    const pendingHero: Hero = {
      updatedAt: hero?.updatedAt ?? new Date(),
      createdAt: hero?.createdAt ?? new Date(),
      id: hero?.id ?? '',
      userId: hero?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingHero,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateHeroAction({ ...values, id: hero.id })
          : await createHeroAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingHero,
        };
        onSuccess(
          editing ? 'update' : 'create',
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  const handleSubmitWrapper = handleSubmit.bind(null, { shopId });

  return (
    <form
      action={handleSubmitWrapper}
      onChange={handleChange}
      className={'space-y-8'}
    >
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.title ? 'text-destructive' : '',
          )}
        >
          Title
        </Label>
        <Input
          type="text"
          name="title"
          className={cn(errors?.title ? 'ring ring-destructive' : '')}
          defaultValue={hero?.title ?? ''}
        />
        {errors?.title ? (
          <p className="text-xs text-destructive mt-2">{errors.title[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.subtitle ? 'text-destructive' : '',
          )}
        >
          Subtitle
        </Label>
        <Input
          type="text"
          name="subtitle"
          className={cn(errors?.subtitle ? 'ring ring-destructive' : '')}
          defaultValue={hero?.subtitle ?? ''}
        />
        {errors?.subtitle ? (
          <p className="text-xs text-destructive mt-2">{errors.subtitle[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.image ? 'text-destructive' : '',
          )}
        >
          Image
        </Label>
        <Input
          type="text"
          name="image"
          className={cn(errors?.image ? 'ring ring-destructive' : '')}
          defaultValue={hero?.image ?? ''}
        />
        {errors?.image ? (
          <p className="text-xs text-destructive mt-2">{errors.image[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={'destructive'}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: 'delete', data: hero });
              const error = await deleteHeroAction(hero.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: hero,
              };

              onSuccess('delete', error ? errorFormatted : undefined);
            });
            router.push(backpath);
          }}
        >
          Delet{isDeleting ? 'ing...' : 'e'}
        </Button>
      ) : null}
    </form>
  );
};

export default HeroForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? 'ing...' : 'e'}`
        : `Creat${isCreating ? 'ing...' : 'e'}`}
    </Button>
  );
};

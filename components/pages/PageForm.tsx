import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/pages/useOptimisticPages';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { type Page, insertPageParams } from '@/lib/db/schema/pages';
import {
  createPageAction,
  deletePageAction,
  updatePageAction,
} from '@/lib/actions/pages';

const PageForm = ({
  shopId,
  page,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  page?: Page | null;
  shopId: string;
  openModal?: (page?: Page) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Page>(insertPageParams);
  const { toast } = useToast();
  const editing = !!page?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const params = useParams();
  const shopSlug = params.shopSlug as string;

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Page },
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
      description: failed ? data?.error ?? 'Error' : `Page ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (
    { shopId }: { shopId: string },
    data: FormData,
  ) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const pageParsed = await insertPageParams.safeParseAsync({
      ...payload,
      shopId,
    });
    if (!pageParsed.success) {
      setErrors(pageParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = pageParsed.data;
    const pendingPage: Page = {
      updatedAt: page?.updatedAt ?? new Date(),
      createdAt: page?.createdAt ?? new Date(),
      id: page?.id ?? '',
      userId: page?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingPage,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updatePageAction({ ...values, id: page.id })
          : await createPageAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingPage,
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
          defaultValue={page?.title ?? ''}
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
            errors?.slug ? 'text-destructive' : '',
          )}
        >
          Slug
        </Label>
        <Input
          type="text"
          name="slug"
          className={cn(errors?.slug ? 'ring ring-destructive' : '')}
          defaultValue={page?.slug ?? ''}
        />
        {errors?.slug ? (
          <p className="text-xs text-destructive mt-2">{errors.slug[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.description ? 'text-destructive' : '',
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? 'ring ring-destructive' : '')}
          defaultValue={page?.description ?? ''}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
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
              addOptimistic && addOptimistic({ action: 'delete', data: page });
              const error = await deletePageAction(page.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: page,
              };

              onSuccess('delete', error ? errorFormatted : undefined);
            });
            router.push('/pages');
          }}
        >
          Delet{isDeleting ? 'ing...' : 'e'}
        </Button>
      ) : null}
    </form>
  );
};

export default PageForm;

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

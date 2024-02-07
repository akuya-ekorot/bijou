import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/content-blocks/useOptimisticContentBlocks';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useBackPath } from '@/components/shared/BackButton';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  type ContentBlock,
  insertContentBlockParams,
} from '@/lib/db/schema/contentBlocks';
import {
  createContentBlockAction,
  deleteContentBlockAction,
  updateContentBlockAction,
} from '@/lib/actions/contentBlocks';
import { type Page, type PageId } from '@/lib/db/schema/pages';

const ContentBlockForm = ({
  pages,
  pageId,
  contentBlock,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  contentBlock?: ContentBlock | null;
  pages: Page[];
  pageId?: PageId;
  openModal?: (contentBlock?: ContentBlock) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<ContentBlock>(insertContentBlockParams);
  const { toast } = useToast();
  const editing = !!contentBlock?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('content-blocks');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: ContentBlock },
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
      description: failed ? data?.error ?? 'Error' : `ContentBlock ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const contentBlockParsed = await insertContentBlockParams.safeParseAsync({
      pageId,
      ...payload,
    });
    if (!contentBlockParsed.success) {
      setErrors(contentBlockParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = contentBlockParsed.data;
    const pendingContentBlock: ContentBlock = {
      updatedAt: contentBlock?.updatedAt ?? new Date(),
      createdAt: contentBlock?.createdAt ?? new Date(),
      id: contentBlock?.id ?? '',
      userId: contentBlock?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingContentBlock,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateContentBlockAction({ ...values, id: contentBlock.id })
          : await createContentBlockAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingContentBlock,
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

  return (
    <form action={handleSubmit} onChange={handleChange} className={'space-y-8'}>
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
          defaultValue={contentBlock?.title ?? ''}
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
            errors?.description ? 'text-destructive' : '',
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? 'ring ring-destructive' : '')}
          defaultValue={contentBlock?.description ?? ''}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.resourceType ? 'text-destructive' : '',
          )}
        >
          Resource Type
        </Label>
        <Input
          type="text"
          name="resourceType"
          className={cn(errors?.resourceType ? 'ring ring-destructive' : '')}
          defaultValue={contentBlock?.resourceType ?? ''}
        />
        {errors?.resourceType ? (
          <p className="text-xs text-destructive mt-2">
            {errors.resourceType[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {pageId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.pageId ? 'text-destructive' : '',
            )}
          >
            Page
          </Label>
          <Select defaultValue={contentBlock?.pageId} name="pageId">
            <SelectTrigger
              className={cn(errors?.pageId ? 'ring ring-destructive' : '')}
            >
              <SelectValue placeholder="Select a page" />
            </SelectTrigger>
            <SelectContent>
              {pages?.map((page) => (
                <SelectItem key={page.id} value={page.id.toString()}>
                  {page.id}
                  {/* TODO: Replace with a field from the page model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.pageId ? (
            <p className="text-xs text-destructive mt-2">{errors.pageId[0]}</p>
          ) : (
            <div className="h-6" />
          )}
        </div>
      )}
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
              addOptimistic &&
                addOptimistic({ action: 'delete', data: contentBlock });
              const error = await deleteContentBlockAction(contentBlock.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: contentBlock,
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

export default ContentBlockForm;

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

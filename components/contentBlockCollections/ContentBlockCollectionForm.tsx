import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/content-block-collections/useOptimisticContentBlockCollections';

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
  type ContentBlockCollection,
  insertContentBlockCollectionParams,
} from '@/lib/db/schema/contentBlockCollections';
import {
  createContentBlockCollectionAction,
  deleteContentBlockCollectionAction,
  updateContentBlockCollectionAction,
} from '@/lib/actions/contentBlockCollections';
import {
  type Collection,
  type CollectionId,
} from '@/lib/db/schema/collections';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';

const ContentBlockCollectionForm = ({
  collections,
  collectionId,
  contentBlocks,
  contentBlockId,
  contentBlockCollection,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  contentBlockCollection?: ContentBlockCollection | null;
  collections: Collection[];
  collectionId?: CollectionId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
  openModal?: (contentBlockCollection?: ContentBlockCollection) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<ContentBlockCollection>(
      insertContentBlockCollectionParams,
    );
  const { toast } = useToast();
  const editing = !!contentBlockCollection?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('content-block-collections');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: ContentBlockCollection },
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
      description: failed
        ? data?.error ?? 'Error'
        : `ContentBlockCollection ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const contentBlockCollectionParsed =
      await insertContentBlockCollectionParams.safeParseAsync({
        collectionId,
        contentBlockId,
        ...payload,
      });
    if (!contentBlockCollectionParsed.success) {
      setErrors(contentBlockCollectionParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = contentBlockCollectionParsed.data;
    const pendingContentBlockCollection: ContentBlockCollection = {
      updatedAt: contentBlockCollection?.updatedAt ?? new Date(),
      createdAt: contentBlockCollection?.createdAt ?? new Date(),
      id: contentBlockCollection?.id ?? '',
      userId: contentBlockCollection?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingContentBlockCollection,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateContentBlockCollectionAction({
              ...values,
              id: contentBlockCollection.id,
            })
          : await createContentBlockCollectionAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingContentBlockCollection,
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

      {collectionId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.collectionId ? 'text-destructive' : '',
            )}
          >
            Collection
          </Label>
          <Select
            defaultValue={contentBlockCollection?.collectionId}
            name="collectionId"
          >
            <SelectTrigger
              className={cn(
                errors?.collectionId ? 'ring ring-destructive' : '',
              )}
            >
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {collections?.map((collection) => (
                <SelectItem
                  key={collection.id}
                  value={collection.id.toString()}
                >
                  {collection.id}
                  {/* TODO: Replace with a field from the collection model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.collectionId ? (
            <p className="text-xs text-destructive mt-2">
              {errors.collectionId[0]}
            </p>
          ) : (
            <div className="h-6" />
          )}
        </div>
      )}

      {contentBlockId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.contentBlockId ? 'text-destructive' : '',
            )}
          >
            ContentBlock
          </Label>
          <Select
            defaultValue={contentBlockCollection?.contentBlockId}
            name="contentBlockId"
          >
            <SelectTrigger
              className={cn(
                errors?.contentBlockId ? 'ring ring-destructive' : '',
              )}
            >
              <SelectValue placeholder="Select a contentBlock" />
            </SelectTrigger>
            <SelectContent>
              {contentBlocks?.map((contentBlock) => (
                <SelectItem
                  key={contentBlock.id}
                  value={contentBlock.id.toString()}
                >
                  {contentBlock.id}
                  {/* TODO: Replace with a field from the contentBlock model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.contentBlockId ? (
            <p className="text-xs text-destructive mt-2">
              {errors.contentBlockId[0]}
            </p>
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
                addOptimistic({
                  action: 'delete',
                  data: contentBlockCollection,
                });
              const error = await deleteContentBlockCollectionAction(
                contentBlockCollection.id,
              );
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: contentBlockCollection,
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

export default ContentBlockCollectionForm;

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

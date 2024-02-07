import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/content-block-products/useOptimisticContentBlockProducts';

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
  type ContentBlockProduct,
  insertContentBlockProductParams,
} from '@/lib/db/schema/contentBlockProducts';
import {
  createContentBlockProductAction,
  deleteContentBlockProductAction,
  updateContentBlockProductAction,
} from '@/lib/actions/contentBlockProducts';
import { type Product, type ProductId } from '@/lib/db/schema/products';
import {
  type ContentBlock,
  type ContentBlockId,
} from '@/lib/db/schema/contentBlocks';

const ContentBlockProductForm = ({
  products,
  productId,
  contentBlocks,
  contentBlockId,
  contentBlockProduct,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  contentBlockProduct?: ContentBlockProduct | null;
  products: Product[];
  productId?: ProductId;
  contentBlocks: ContentBlock[];
  contentBlockId?: ContentBlockId;
  openModal?: (contentBlockProduct?: ContentBlockProduct) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<ContentBlockProduct>(insertContentBlockProductParams);
  const { toast } = useToast();
  const editing = !!contentBlockProduct?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath('content-block-products');

  const onSuccess = (
    action: Action,
    data?: { error: string; values: ContentBlockProduct },
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
        : `ContentBlockProduct ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const contentBlockProductParsed =
      await insertContentBlockProductParams.safeParseAsync({
        productId,
        contentBlockId,
        ...payload,
      });
    if (!contentBlockProductParsed.success) {
      setErrors(contentBlockProductParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = contentBlockProductParsed.data;
    const pendingContentBlockProduct: ContentBlockProduct = {
      updatedAt: contentBlockProduct?.updatedAt ?? new Date(),
      createdAt: contentBlockProduct?.createdAt ?? new Date(),
      id: contentBlockProduct?.id ?? '',
      userId: contentBlockProduct?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingContentBlockProduct,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateContentBlockProductAction({
              ...values,
              id: contentBlockProduct.id,
            })
          : await createContentBlockProductAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingContentBlockProduct,
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

      {productId ? null : (
        <div>
          <Label
            className={cn(
              'mb-2 inline-block',
              errors?.productId ? 'text-destructive' : '',
            )}
          >
            Product
          </Label>
          <Select
            defaultValue={contentBlockProduct?.productId}
            name="productId"
          >
            <SelectTrigger
              className={cn(errors?.productId ? 'ring ring-destructive' : '')}
            >
              <SelectValue placeholder="Select a product" />
            </SelectTrigger>
            <SelectContent>
              {products?.map((product) => (
                <SelectItem key={product.id} value={product.id.toString()}>
                  {product.id}
                  {/* TODO: Replace with a field from the product model */}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.productId ? (
            <p className="text-xs text-destructive mt-2">
              {errors.productId[0]}
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
            defaultValue={contentBlockProduct?.contentBlockId}
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
                addOptimistic({ action: 'delete', data: contentBlockProduct });
              const error = await deleteContentBlockProductAction(
                contentBlockProduct.id,
              );
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: contentBlockProduct,
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

export default ContentBlockProductForm;

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

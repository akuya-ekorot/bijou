import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/customers/useOptimisticCustomers';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { type Customer, insertCustomerParams } from '@/lib/db/schema/customers';
import {
  createCustomerAction,
  deleteCustomerAction,
  updateCustomerAction,
} from '@/lib/actions/customers';

const CustomerForm = ({
  customer,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  customer?: Customer | null;

  openModal?: (customer?: Customer) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Customer>(insertCustomerParams);
  const { toast } = useToast();
  const editing = !!customer?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Customer },
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
      description: failed ? data?.error ?? 'Error' : `Customer ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const customerParsed = await insertCustomerParams.safeParseAsync(payload);
    if (!customerParsed.success) {
      setErrors(customerParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = customerParsed.data;
    const pendingCustomer: Customer = {
      updatedAt: customer?.updatedAt ?? new Date(),
      createdAt: customer?.createdAt ?? new Date(),
      id: customer?.id ?? '',
      userId: customer?.userId ?? '',
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingCustomer,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateCustomerAction({ ...values, id: customer.id })
          : await createCustomerAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingCustomer,
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
            errors?.name ? 'text-destructive' : '',
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? 'ring ring-destructive' : '')}
          defaultValue={customer?.name ?? ''}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.email ? 'text-destructive' : '',
          )}
        >
          Email
        </Label>
        <Input
          type="text"
          name="email"
          className={cn(errors?.email ? 'ring ring-destructive' : '')}
          defaultValue={customer?.email ?? ''}
        />
        {errors?.email ? (
          <p className="text-xs text-destructive mt-2">{errors.email[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.phone ? 'text-destructive' : '',
          )}
        >
          Phone
        </Label>
        <Input
          type="text"
          name="phone"
          className={cn(errors?.phone ? 'ring ring-destructive' : '')}
          defaultValue={customer?.phone ?? ''}
        />
        {errors?.phone ? (
          <p className="text-xs text-destructive mt-2">{errors.phone[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.address ? 'text-destructive' : '',
          )}
        >
          Address
        </Label>
        <Input
          type="text"
          name="address"
          className={cn(errors?.address ? 'ring ring-destructive' : '')}
          defaultValue={customer?.address ?? ''}
        />
        {errors?.address ? (
          <p className="text-xs text-destructive mt-2">{errors.address[0]}</p>
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
              addOptimistic &&
                addOptimistic({ action: 'delete', data: customer });
              const error = await deleteCustomerAction(customer.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: customer,
              };

              onSuccess('delete', error ? errorFormatted : undefined);
            });
            router.push('/customers');
          }}
        >
          Delet{isDeleting ? 'ing...' : 'e'}
        </Button>
      ) : null}
    </form>
  );
};

export default CustomerForm;

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

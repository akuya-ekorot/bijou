import { z } from 'zod';

import { useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useValidatedForm } from '@/lib/hooks/useValidatedForm';

import { type Action, cn } from '@/lib/utils';
import { type TAddOptimistic } from '@/app/[shopSlug]/orders/useOptimisticOrders';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

import { type Order, insertOrderParams } from '@/lib/db/schema/orders';
import {
  createOrderAction,
  deleteOrderAction,
  updateOrderAction,
} from '@/lib/actions/orders';
import { type Customer } from '@/lib/db/schema/customers';
import { type Payment } from '@/lib/db/schema/payments';

const OrderForm = ({
  customers,
  payments,
  order,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  order?: Order | null;
  customers: Customer[];
  payments: Payment[];
  openModal?: (order?: Order) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Order>(insertOrderParams);
  const { toast } = useToast();
  const editing = !!order?.id;
  const [paidAt, setPaidAt] = useState<Date | undefined>(order?.paidAt);

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Order },
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
      description: failed ? data?.error ?? 'Error' : `Order ${action}d!`,
      variant: failed ? 'destructive' : 'default',
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const orderParsed = await insertOrderParams.safeParseAsync(payload);
    if (!orderParsed.success) {
      setErrors(orderParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = orderParsed.data;
    const pendingOrder: Order = {
      updatedAt: order?.updatedAt ?? new Date(),
      createdAt: order?.createdAt ?? new Date(),
      id: order?.id ?? '',
      userId: order?.userId ?? '',
      ...values,
      paidAt: new Date(orderParsed.data.paidAt),
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingOrder,
            action: editing ? 'update' : 'create',
          });

        const error = editing
          ? await updateOrderAction({ ...values, id: order.id })
          : await createOrderAction(values);

        const errorFormatted = {
          error: error ?? 'Error',
          values: pendingOrder,
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
            errors?.customerId ? 'text-destructive' : '',
          )}
        >
          Customer
        </Label>
        <Select defaultValue={order?.customerId} name="customerId">
          <SelectTrigger
            className={cn(errors?.customerId ? 'ring ring-destructive' : '')}
          >
            <SelectValue placeholder="Select a customer" />
          </SelectTrigger>
          <SelectContent>
            {customers?.map((customer) => (
              <SelectItem key={customer.id} value={customer.id.toString()}>
                {customer.id}
                {/* TODO: Replace with a field from the customer model */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.customerId ? (
          <p className="text-xs text-destructive mt-2">
            {errors.customerId[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.paidAt ? 'text-destructive' : '',
          )}
        >
          Paid At
        </Label>
        <br />
        <Popover>
          <Input
            name="paidAt"
            onChange={() => {}}
            readOnly
            value={paidAt?.toUTCString() ?? new Date().toUTCString()}
            className="hidden"
          />

          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] pl-3 text-left font-normal',
                !order?.paidAt && 'text-muted-foreground',
              )}
            >
              {paidAt ? (
                <span>{format(paidAt, 'PPP')}</span>
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              onSelect={(e) => setPaidAt(e)}
              selected={paidAt}
              disabled={(date) =>
                date > new Date() || date < new Date('1900-01-01')
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.paidAt ? (
          <p className="text-xs text-destructive mt-2">{errors.paidAt[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.status ? 'text-destructive' : '',
          )}
        >
          Status
        </Label>
        <Input
          type="text"
          name="status"
          className={cn(errors?.status ? 'ring ring-destructive' : '')}
          defaultValue={order?.status ?? ''}
        />
        {errors?.status ? (
          <p className="text-xs text-destructive mt-2">{errors.status[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.amount ? 'text-destructive' : '',
          )}
        >
          Amount
        </Label>
        <Input
          type="text"
          name="amount"
          className={cn(errors?.amount ? 'ring ring-destructive' : '')}
          defaultValue={order?.amount ?? ''}
        />
        {errors?.amount ? (
          <p className="text-xs text-destructive mt-2">{errors.amount[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            'mb-2 inline-block',
            errors?.paymentId ? 'text-destructive' : '',
          )}
        >
          Payment
        </Label>
        <Select defaultValue={order?.paymentId} name="paymentId">
          <SelectTrigger
            className={cn(errors?.paymentId ? 'ring ring-destructive' : '')}
          >
            <SelectValue placeholder="Select a payment" />
          </SelectTrigger>
          <SelectContent>
            {payments?.map((payment) => (
              <SelectItem key={payment.id} value={payment.id.toString()}>
                {payment.id}
                {/* TODO: Replace with a field from the payment model */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.paymentId ? (
          <p className="text-xs text-destructive mt-2">{errors.paymentId[0]}</p>
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
              addOptimistic && addOptimistic({ action: 'delete', data: order });
              const error = await deleteOrderAction(order.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? 'Error',
                values: order,
              };

              onSuccess('delete', error ? errorFormatted : undefined);
            });
            router.push('/orders');
          }}
        >
          Delet{isDeleting ? 'ing...' : 'e'}
        </Button>
      ) : null}
    </form>
  );
};

export default OrderForm;

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

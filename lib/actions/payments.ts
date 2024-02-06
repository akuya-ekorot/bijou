'use server';

import { revalidatePath } from 'next/cache';
import {
  createPayment,
  deletePayment,
  updatePayment,
} from '@/lib/api/payments/mutations';
import {
  PaymentId,
  NewPaymentParams,
  UpdatePaymentParams,
  paymentIdSchema,
  insertPaymentParams,
  updatePaymentParams,
} from '@/lib/db/schema/payments';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidatePayments = () => revalidatePath('/payments');

export const createPaymentAction = async (input: NewPaymentParams) => {
  try {
    const payload = insertPaymentParams.parse(input);
    await createPayment(payload);
    revalidatePayments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updatePaymentAction = async (input: UpdatePaymentParams) => {
  try {
    const payload = updatePaymentParams.parse(input);
    await updatePayment(payload.id, payload);
    revalidatePayments();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deletePaymentAction = async (input: PaymentId) => {
  try {
    const payload = paymentIdSchema.parse({ id: input });
    await deletePayment(payload.id);
    revalidatePayments();
  } catch (e) {
    return handleErrors(e);
  }
};

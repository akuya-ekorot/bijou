import { db } from '@/lib/db/index';
import { eq, and } from 'drizzle-orm';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type PaymentId,
  paymentIdSchema,
  payments,
} from '@/lib/db/schema/payments';

export const getPayments = async () => {
  const { session } = await getUserAuth();
  const p = await db
    .select()
    .from(payments)
    .where(eq(payments.userId, session?.user.id!));
  return { payments: p };
};

export const getPaymentById = async (id: PaymentId) => {
  const { session } = await getUserAuth();
  const { id: paymentId } = paymentIdSchema.parse({ id });
  const [p] = await db
    .select()
    .from(payments)
    .where(
      and(eq(payments.id, paymentId), eq(payments.userId, session?.user.id!)),
    );
  return { payment: p };
};

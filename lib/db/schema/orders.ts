import { sql } from 'drizzle-orm';
import { varchar, timestamp, text, real, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { customers } from './customers';
import { payments } from './payments';
import { users } from '@/lib/db/schema/auth';
import { type getOrders } from '@/lib/api/orders/queries';

import { nanoid, timestamps } from '@/lib/utils';
import { shops } from './shops';

export const orders = pgTable('orders', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  customerId: varchar('customer_id', { length: 256 })
    .references(() => customers.id)
    .notNull(),
  paidAt: timestamp('paid_at').notNull(),
  status: text('status').notNull(),
  amount: real('amount').notNull(),
  shopId: varchar('shop_id', { length: 256 })
    .references(() => shops.id)
    .notNull(),
  paymentId: varchar('payment_id', { length: 256 })
    .references(() => payments.id)
    .notNull(),
  userId: varchar('user_id', { length: 256 })
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`),
});

// Schema for orders - used to validate API requests
const baseSchema = createSelectSchema(orders).omit(timestamps);

export const insertOrderSchema = createInsertSchema(orders).omit(timestamps);
export const insertOrderParams = baseSchema
  .extend({
    customerId: z.coerce.string().min(1),
    paidAt: z.coerce.string().min(1),
    amount: z.coerce.number(),
    paymentId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateOrderSchema = baseSchema;
export const updateOrderParams = baseSchema
  .extend({
    customerId: z.coerce.string().min(1),
    paidAt: z.coerce.string().min(1),
    amount: z.coerce.number(),
    paymentId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const orderIdSchema = baseSchema.pick({ id: true });

// Types for orders - used to type API request params and within Components
export type Order = typeof orders.$inferSelect;
export type NewOrder = z.infer<typeof insertOrderSchema>;
export type NewOrderParams = z.infer<typeof insertOrderParams>;
export type UpdateOrderParams = z.infer<typeof updateOrderParams>;
export type OrderId = z.infer<typeof orderIdSchema>['id'];

// this type infers the return from getOrders() - meaning it will include any joins
export type CompleteOrder = Awaited<
  ReturnType<typeof getOrders>
>['orders'][number];

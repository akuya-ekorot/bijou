import { sql } from 'drizzle-orm';
import { varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { orders } from './orders';
import { products } from './products';
import { shops } from './shops';
import { users } from '@/lib/db/schema/auth';
import { type getOrderItems } from '@/lib/api/orderItems/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const orderItems = pgTable('order_items', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  orderId: varchar('order_id', { length: 256 })
    .references(() => orders.id)
    .notNull(),
  productId: varchar('product_id', { length: 256 })
    .references(() => products.id)
    .notNull(),
  shopId: varchar('shop_id', { length: 256 })
    .references(() => shops.id, { onDelete: 'cascade' })
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

// Schema for orderItems - used to validate API requests
const baseSchema = createSelectSchema(orderItems).omit(timestamps);

export const insertOrderItemSchema =
  createInsertSchema(orderItems).omit(timestamps);
export const insertOrderItemParams = baseSchema
  .extend({
    orderId: z.coerce.string().min(1),
    productId: z.coerce.string().min(1),
    shopId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateOrderItemSchema = baseSchema;
export const updateOrderItemParams = baseSchema
  .extend({
    orderId: z.coerce.string().min(1),
    productId: z.coerce.string().min(1),
    shopId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const orderItemIdSchema = baseSchema.pick({ id: true });

// Types for orderItems - used to type API request params and within Components
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = z.infer<typeof insertOrderItemSchema>;
export type NewOrderItemParams = z.infer<typeof insertOrderItemParams>;
export type UpdateOrderItemParams = z.infer<typeof updateOrderItemParams>;
export type OrderItemId = z.infer<typeof orderItemIdSchema>['id'];

// this type infers the return from getOrderItems() - meaning it will include any joins
export type CompleteOrderItem = Awaited<
  ReturnType<typeof getOrderItems>
>['orderItems'][number];

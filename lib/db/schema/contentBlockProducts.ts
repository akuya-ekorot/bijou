import { sql } from 'drizzle-orm';
import { varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { products } from './products';
import { contentBlocks } from './contentBlocks';
import { users } from '@/lib/db/schema/auth';
import { type getContentBlockProducts } from '@/lib/api/contentBlockProducts/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const contentBlockProducts = pgTable('content_block_products', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  productId: varchar('product_id', { length: 256 })
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  contentBlockId: varchar('content_block_id', { length: 256 })
    .references(() => contentBlocks.id, { onDelete: 'cascade' })
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

// Schema for contentBlockProducts - used to validate API requests
const baseSchema = createSelectSchema(contentBlockProducts).omit(timestamps);

export const insertContentBlockProductSchema =
  createInsertSchema(contentBlockProducts).omit(timestamps);
export const insertContentBlockProductParams = baseSchema
  .extend({
    productId: z.coerce.string().min(1),
    contentBlockId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateContentBlockProductSchema = baseSchema;
export const updateContentBlockProductParams = baseSchema
  .extend({
    productId: z.coerce.string().min(1),
    contentBlockId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const contentBlockProductIdSchema = baseSchema.pick({ id: true });

// Types for contentBlockProducts - used to type API request params and within Components
export type ContentBlockProduct = typeof contentBlockProducts.$inferSelect;
export type NewContentBlockProduct = z.infer<
  typeof insertContentBlockProductSchema
>;
export type NewContentBlockProductParams = z.infer<
  typeof insertContentBlockProductParams
>;
export type UpdateContentBlockProductParams = z.infer<
  typeof updateContentBlockProductParams
>;
export type ContentBlockProductId = z.infer<
  typeof contentBlockProductIdSchema
>['id'];

// this type infers the return from getContentBlockProducts() - meaning it will include any joins
export type CompleteContentBlockProduct = Awaited<
  ReturnType<typeof getContentBlockProducts>
>['contentBlockProducts'][number];

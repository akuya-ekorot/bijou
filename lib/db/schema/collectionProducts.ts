import { sql } from 'drizzle-orm';
import { varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { collections } from './collections';
import { products } from './products';
import { type getCollectionProducts } from '@/lib/api/collectionProducts/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const collectionProducts = pgTable('collection_products', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  collectionId: varchar('collection_id', { length: 256 })
    .references(() => collections.id)
    .notNull(),
  productId: varchar('product_id', { length: 256 })
    .references(() => products.id)
    .notNull(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`),
});

// Schema for collectionProducts - used to validate API requests
const baseSchema = createSelectSchema(collectionProducts).omit(timestamps);

export const insertCollectionProductSchema =
  createInsertSchema(collectionProducts).omit(timestamps);
export const insertCollectionProductParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    productId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
  });

export const updateCollectionProductSchema = baseSchema;
export const updateCollectionProductParams = baseSchema.extend({
  collectionId: z.coerce.string().min(1),
  productId: z.coerce.string().min(1),
});
export const collectionProductIdSchema = baseSchema.pick({ id: true });

// Types for collectionProducts - used to type API request params and within Components
export type CollectionProduct = typeof collectionProducts.$inferSelect;
export type NewCollectionProduct = z.infer<
  typeof insertCollectionProductSchema
>;
export type NewCollectionProductParams = z.infer<
  typeof insertCollectionProductParams
>;
export type UpdateCollectionProductParams = z.infer<
  typeof updateCollectionProductParams
>;
export type CollectionProductId = z.infer<
  typeof collectionProductIdSchema
>['id'];

// this type infers the return from getCollectionProducts() - meaning it will include any joins
export type CompleteCollectionProduct = Awaited<
  ReturnType<typeof getCollectionProducts>
>['collectionProducts'][number];

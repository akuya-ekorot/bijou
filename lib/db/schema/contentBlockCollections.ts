import { sql } from 'drizzle-orm';
import { varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { collections } from './collections';
import { contentBlocks } from './contentBlocks';
import { users } from '@/lib/db/schema/auth';
import { type getContentBlockCollections } from '@/lib/api/contentBlockCollections/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const contentBlockCollections = pgTable('content_block_collections', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  collectionId: varchar('collection_id', { length: 256 })
    .references(() => collections.id, { onDelete: 'cascade' })
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

// Schema for contentBlockCollections - used to validate API requests
const baseSchema = createSelectSchema(contentBlockCollections).omit(timestamps);

export const insertContentBlockCollectionSchema = createInsertSchema(
  contentBlockCollections,
).omit(timestamps);
export const insertContentBlockCollectionParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    contentBlockId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateContentBlockCollectionSchema = baseSchema;
export const updateContentBlockCollectionParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    contentBlockId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const contentBlockCollectionIdSchema = baseSchema.pick({ id: true });

// Types for contentBlockCollections - used to type API request params and within Components
export type ContentBlockCollection =
  typeof contentBlockCollections.$inferSelect;
export type NewContentBlockCollection = z.infer<
  typeof insertContentBlockCollectionSchema
>;
export type NewContentBlockCollectionParams = z.infer<
  typeof insertContentBlockCollectionParams
>;
export type UpdateContentBlockCollectionParams = z.infer<
  typeof updateContentBlockCollectionParams
>;
export type ContentBlockCollectionId = z.infer<
  typeof contentBlockCollectionIdSchema
>['id'];

// this type infers the return from getContentBlockCollections() - meaning it will include any joins
export type CompleteContentBlockCollection = Awaited<
  ReturnType<typeof getContentBlockCollections>
>['contentBlockCollections'][number];

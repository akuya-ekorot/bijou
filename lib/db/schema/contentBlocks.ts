import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { pages } from './pages';
import { users } from '@/lib/db/schema/auth';
import { type getContentBlocks } from '@/lib/api/contentBlocks/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const resourceTypes = pgEnum('resource_types', [
  'products',
  'collections',
]);

export const contentBlocks = pgTable('content_blocks', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  description: text('description'),
  resourceType: resourceTypes('resource_type').notNull(),
  pageId: varchar('page_id', { length: 256 })
    .references(() => pages.id, { onDelete: 'cascade' })
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

// Schema for contentBlocks - used to validate API requests
const baseSchema = createSelectSchema(contentBlocks).omit(timestamps);

export const insertContentBlockSchema =
  createInsertSchema(contentBlocks).omit(timestamps);
export const insertContentBlockParams = baseSchema
  .extend({
    pageId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateContentBlockSchema = baseSchema;
export const updateContentBlockParams = baseSchema
  .extend({
    pageId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const contentBlockIdSchema = baseSchema.pick({ id: true });

// Types for contentBlocks - used to type API request params and within Components
export type ContentBlock = typeof contentBlocks.$inferSelect;
export type NewContentBlock = z.infer<typeof insertContentBlockSchema>;
export type NewContentBlockParams = z.infer<typeof insertContentBlockParams>;
export type UpdateContentBlockParams = z.infer<typeof updateContentBlockParams>;
export type ContentBlockId = z.infer<typeof contentBlockIdSchema>['id'];

// this type infers the return from getContentBlocks() - meaning it will include any joins
export type CompleteContentBlock = Awaited<
  ReturnType<typeof getContentBlocks>
>['contentBlocks'][number];

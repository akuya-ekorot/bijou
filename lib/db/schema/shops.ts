import { sql } from 'drizzle-orm';
import {
  text,
  varchar,
  timestamp,
  pgTable,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/auth';
import { type getShops } from '@/lib/api/shops/queries';

import { nanoid, timestamps } from '@/lib/utils';

export const shops = pgTable(
  'shops',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    logoUrl: text('logo_url'),
    userId: varchar('user_id', { length: 256 })
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  (shops) => {
    return {
      slugIndex: uniqueIndex('slug_idx').on(shops.slug),
    };
  },
);

// Schema for shops - used to validate API requests
const baseSchema = createSelectSchema(shops).omit(timestamps);

export const insertShopSchema = createInsertSchema(shops).omit(timestamps);
export const insertShopParams = baseSchema
  .extend({
    name: z.string().min(3),
    slug: z.string().min(3),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateShopSchema = baseSchema;
export const updateShopParams = baseSchema.extend({}).omit({
  userId: true,
});
export const shopIdSchema = baseSchema.pick({ id: true });
export const shopSlugSchema = baseSchema.pick({ slug: true });

// Types for shops - used to type API request params and within Components
export type Shop = typeof shops.$inferSelect;
export type NewShop = z.infer<typeof insertShopSchema>;
export type NewShopParams = z.infer<typeof insertShopParams>;
export type UpdateShopParams = z.infer<typeof updateShopParams>;
export type ShopId = z.infer<typeof shopIdSchema>['id'];
export type ShopSlug = z.infer<typeof shopSlugSchema>['slug'];

// this type infers the return from getShops() - meaning it will include any joins
export type CompleteShop = Awaited<
  ReturnType<typeof getShops>
>['shops'][number];

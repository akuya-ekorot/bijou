import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { users } from '@/lib/db/schema/auth';
import { type getHeroes } from '@/lib/api/heroes/queries';

import { nanoid, timestamps } from '@/lib/utils';
import { shops } from './shops';

export const heroes = pgTable('heroes', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  image: text('image'),
  shopId: varchar('shop_id', { length: 191 })
    .references(() => shops.id)
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

// Schema for heroes - used to validate API requests
const baseSchema = createSelectSchema(heroes).omit(timestamps);

export const insertHeroSchema = createInsertSchema(heroes).omit(timestamps);
export const insertHeroParams = baseSchema.extend({}).omit({
  id: true,
  userId: true,
});

export const updateHeroSchema = baseSchema;
export const updateHeroParams = baseSchema.extend({}).omit({
  userId: true,
});
export const heroIdSchema = baseSchema.pick({ id: true });

// Types for heroes - used to type API request params and within Components
export type Hero = typeof heroes.$inferSelect;
export type NewHero = z.infer<typeof insertHeroSchema>;
export type NewHeroParams = z.infer<typeof insertHeroParams>;
export type UpdateHeroParams = z.infer<typeof updateHeroParams>;
export type HeroId = z.infer<typeof heroIdSchema>['id'];

// this type infers the return from getHeroes() - meaning it will include any joins
export type CompleteHero = Awaited<
  ReturnType<typeof getHeroes>
>['heroes'][number];

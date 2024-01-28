import { type getCollectionProducts } from "@/lib/api/collectionProducts/queries";
import { users } from "@/lib/db/schema/auth";
import { sql } from "drizzle-orm";
import { pgTable, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { collections } from "./collections";
import { products } from "./products";

import { nanoid, timestamps } from "@/lib/utils";

export const collectionProducts = pgTable(
  "collection_products",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    collectionId: varchar("collection_id", { length: 256 })
      .references(() => collections.id, { onDelete: "cascade" })
      .notNull(),
    productId: varchar("product_id", { length: 256 })
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    userId: varchar("user_id", { length: 256 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  },
  (t) => ({
    unq: unique().on(t.productId, t.collectionId),
  }),
);

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
    userId: true,
  });

export const updateCollectionProductSchema = baseSchema;
export const updateCollectionProductParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    productId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
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
>["id"];

// this type infers the return from getCollectionProducts() - meaning it will include any joins
export type CompleteCollectionProduct = Awaited<
  ReturnType<typeof getCollectionProducts>
>["collectionProducts"][number];

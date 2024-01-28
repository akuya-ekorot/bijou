import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable, unique } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { shops } from "./shops";
import { users } from "@/lib/db/schema/auth";
import {
  getProductsByShopId,
  type getProducts,
} from "@/lib/api/products/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const products = pgTable(
  "products",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    shopId: varchar("shop_id", { length: 256 })
      .references(() => shops.id, { onDelete: "cascade" })
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
    unq: unique().on(t.slug, t.shopId).nullsNotDistinct(),
  }),
);

// Schema for products - used to validate API requests
const baseSchema = createSelectSchema(products).omit(timestamps);

export const insertProductSchema =
  createInsertSchema(products).omit(timestamps);
export const insertProductParams = baseSchema
  .extend({
    shopId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateProductSchema = baseSchema;
export const updateProductParams = baseSchema
  .extend({
    shopId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const productIdSchema = baseSchema.pick({ id: true });
export const productShopIdSchema = baseSchema.pick({ shopId: true });

// Types for products - used to type API request params and within Components
export type Product = typeof products.$inferSelect;
export type NewProduct = z.infer<typeof insertProductSchema>;
export type NewProductParams = z.infer<typeof insertProductParams>;
export type UpdateProductParams = z.infer<typeof updateProductParams>;
export type ProductId = z.infer<typeof productIdSchema>["id"];
export type ProductShopId = z.infer<typeof productShopIdSchema>["shopId"];

// this type infers the return from getProducts() - meaning it will include any joins
export type CompleteProduct = Awaited<
  ReturnType<typeof getProductsByShopId>
>["products"][number];

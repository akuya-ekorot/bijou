import { sql } from "drizzle-orm";
import { text, real, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getProducts } from "@/lib/api/products/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const products = pgTable("products", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  price: real("price"),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for products - used to validate API requests
const baseSchema = createSelectSchema(products).omit(timestamps);

export const insertProductSchema =
  createInsertSchema(products).omit(timestamps);
export const insertProductParams = baseSchema
  .extend({
    price: z.coerce.number(),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateProductSchema = baseSchema;
export const updateProductParams = baseSchema
  .extend({
    price: z.coerce.number(),
  })
  .omit({
    userId: true,
  });
export const productIdSchema = baseSchema.pick({ id: true });

// Types for products - used to type API request params and within Components
export type Product = typeof products.$inferSelect;
export type NewProduct = z.infer<typeof insertProductSchema>;
export type NewProductParams = z.infer<typeof insertProductParams>;
export type UpdateProductParams = z.infer<typeof updateProductParams>;
export type ProductId = z.infer<typeof productIdSchema>["id"];

// this type infers the return from getProducts() - meaning it will include any joins
export type CompleteProduct = Awaited<
  ReturnType<typeof getProducts>
>["products"][number];

import { sql } from "drizzle-orm";
import { varchar, integer, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { products } from "./products";
import { images } from "./images";
import { type getProductImages } from "@/lib/api/productImages/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const productImages = pgTable("product_images", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  productId: varchar("product_id", { length: 256 })
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  imageId: varchar("image_id", { length: 256 })
    .references(() => images.id, { onDelete: "cascade" })
    .notNull(),
  order: integer("order"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for productImages - used to validate API requests
const baseSchema = createSelectSchema(productImages).omit(timestamps);

export const insertProductImageSchema =
  createInsertSchema(productImages).omit(timestamps);
export const insertProductImageParams = baseSchema
  .extend({
    productId: z.coerce.string().min(1),
    imageId: z.coerce.string().min(1),
    order: z.coerce.number(),
  })
  .omit({
    id: true,
  });

export const updateProductImageSchema = baseSchema;
export const updateProductImageParams = baseSchema.extend({
  productId: z.coerce.string().min(1),
  imageId: z.coerce.string().min(1),
  order: z.coerce.number(),
});
export const productImageIdSchema = baseSchema.pick({ id: true });

// Types for productImages - used to type API request params and within Components
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = z.infer<typeof insertProductImageSchema>;
export type NewProductImageParams = z.infer<typeof insertProductImageParams>;
export type UpdateProductImageParams = z.infer<typeof updateProductImageParams>;
export type ProductImageId = z.infer<typeof productImageIdSchema>["id"];

// this type infers the return from getProductImages() - meaning it will include any joins
export type CompleteProductImage = Awaited<
  ReturnType<typeof getProductImages>
>["productImages"][number];

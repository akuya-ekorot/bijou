import { sql } from "drizzle-orm";
import {
  varchar,
  timestamp,
  pgTable,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { collections } from "./collections";
import { images } from "./images";
import { users } from "@/lib/db/schema/auth";
import { type getCollectionImages } from "@/lib/api/collectionImages/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const collectionImages = pgTable("collection_images", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  order: integer("order").notNull().default(0),
  collectionId: varchar("collection_id", { length: 256 })
    .references(() => collections.id, { onDelete: "cascade" })
    .notNull(),
  imageId: varchar("image_id", { length: 256 })
    .references(() => images.id, { onDelete: "cascade" })
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
});

// Schema for collectionImages - used to validate API requests
const baseSchema = createSelectSchema(collectionImages).omit(timestamps);

export const insertCollectionImageSchema =
  createInsertSchema(collectionImages).omit(timestamps);
export const insertCollectionImageParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    imageId: z.coerce.string().min(1),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updateCollectionImageSchema = baseSchema;
export const updateCollectionImageParams = baseSchema
  .extend({
    collectionId: z.coerce.string().min(1),
    imageId: z.coerce.string().min(1),
  })
  .omit({
    userId: true,
  });
export const collectionImageIdSchema = baseSchema.pick({ id: true });

// Types for collectionImages - used to type API request params and within Components
export type CollectionImage = typeof collectionImages.$inferSelect;
export type NewCollectionImage = z.infer<typeof insertCollectionImageSchema>;
export type NewCollectionImageParams = z.infer<
  typeof insertCollectionImageParams
>;
export type UpdateCollectionImageParams = z.infer<
  typeof updateCollectionImageParams
>;
export type CollectionImageId = z.infer<typeof collectionImageIdSchema>["id"];

// this type infers the return from getCollectionImages() - meaning it will include any joins
export type CompleteCollectionImage = Awaited<
  ReturnType<typeof getCollectionImages>
>["collectionImages"][number];

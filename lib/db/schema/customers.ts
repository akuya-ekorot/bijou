import { sql } from "drizzle-orm";
import {
  text,
  varchar,
  timestamp,
  pgTable,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getCustomers } from "@/lib/api/customers/queries";

import { nanoid, timestamps } from "@/lib/utils";
import { shops } from "./shops";

export const customers = pgTable(
  "customers",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    address: text("address"),
    shopId: varchar("shop_id", { length: 191 })
      .references(() => shops.id)
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
  (customers) => {
    return {
      emailIndex: uniqueIndex("customer_email_idx").on(customers.email),
    };
  },
);

// Schema for customers - used to validate API requests
const baseSchema = createSelectSchema(customers).omit(timestamps);

export const insertCustomerSchema =
  createInsertSchema(customers).omit(timestamps);
export const insertCustomerParams = baseSchema.extend({}).omit({
  id: true,
  userId: true,
});

export const updateCustomerSchema = baseSchema;
export const updateCustomerParams = baseSchema.extend({}).omit({
  userId: true,
});
export const customerIdSchema = baseSchema.pick({ id: true });

// Types for customers - used to type API request params and within Components
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = z.infer<typeof insertCustomerSchema>;
export type NewCustomerParams = z.infer<typeof insertCustomerParams>;
export type UpdateCustomerParams = z.infer<typeof updateCustomerParams>;
export type CustomerId = z.infer<typeof customerIdSchema>["id"];

// this type infers the return from getCustomers() - meaning it will include any joins
export type CompleteCustomer = Awaited<
  ReturnType<typeof getCustomers>
>["customers"][number];

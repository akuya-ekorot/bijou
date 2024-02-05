import { sql } from "drizzle-orm";
import { text, real, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "@/lib/db/schema/auth";
import { type getPayments } from "@/lib/api/payments/queries";

import { nanoid, timestamps } from "@/lib/utils";

export const payments = pgTable("payments", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  status: text("status").notNull(),
  reference: text("reference").notNull(),
  amount: real("amount").notNull(),
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

// Schema for payments - used to validate API requests
const baseSchema = createSelectSchema(payments).omit(timestamps);

export const insertPaymentSchema =
  createInsertSchema(payments).omit(timestamps);
export const insertPaymentParams = baseSchema
  .extend({
    amount: z.coerce.number(),
  })
  .omit({
    id: true,
    userId: true,
  });

export const updatePaymentSchema = baseSchema;
export const updatePaymentParams = baseSchema
  .extend({
    amount: z.coerce.number(),
  })
  .omit({
    userId: true,
  });
export const paymentIdSchema = baseSchema.pick({ id: true });

// Types for payments - used to type API request params and within Components
export type Payment = typeof payments.$inferSelect;
export type NewPayment = z.infer<typeof insertPaymentSchema>;
export type NewPaymentParams = z.infer<typeof insertPaymentParams>;
export type UpdatePaymentParams = z.infer<typeof updatePaymentParams>;
export type PaymentId = z.infer<typeof paymentIdSchema>["id"];

// this type infers the return from getPayments() - meaning it will include any joins
export type CompletePayment = Awaited<
  ReturnType<typeof getPayments>
>["payments"][number];

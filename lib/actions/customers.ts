"use server";

import { revalidatePath } from "next/cache";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/api/customers/mutations";
import {
  CustomerId,
  NewCustomerParams,
  UpdateCustomerParams,
  customerIdSchema,
  insertCustomerParams,
  updateCustomerParams,
} from "@/lib/db/schema/customers";

const handleErrors = (e: unknown) => {
  const errMsg = "Error, please try again.";
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === "object" && "error" in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateCustomers = () => revalidatePath("/customers");

export const createCustomerAction = async (input: NewCustomerParams) => {
  try {
    const payload = insertCustomerParams.parse(input);
    await createCustomer(payload);
    revalidateCustomers();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateCustomerAction = async (input: UpdateCustomerParams) => {
  try {
    const payload = updateCustomerParams.parse(input);
    await updateCustomer(payload.id, payload);
    revalidateCustomers();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteCustomerAction = async (input: CustomerId) => {
  try {
    const payload = customerIdSchema.parse({ id: input });
    await deleteCustomer(payload.id);
    revalidateCustomers();
  } catch (e) {
    return handleErrors(e);
  }
};
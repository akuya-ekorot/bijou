import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import { 
  OrderItemId, 
  NewOrderItemParams,
  UpdateOrderItemParams, 
  updateOrderItemSchema,
  insertOrderItemSchema, 
  orderItems,
  orderItemIdSchema 
} from "@/lib/db/schema/orderItems";
import { getUserAuth } from "@/lib/auth/utils";

export const createOrderItem = async (orderItem: NewOrderItemParams) => {
  const { session } = await getUserAuth();
  const newOrderItem = insertOrderItemSchema.parse({ ...orderItem, userId: session?.user.id! });
  try {
    const [o] =  await db.insert(orderItems).values(newOrderItem).returning();
    return { orderItem: o };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateOrderItem = async (id: OrderItemId, orderItem: UpdateOrderItemParams) => {
  const { session } = await getUserAuth();
  const { id: orderItemId } = orderItemIdSchema.parse({ id });
  const newOrderItem = updateOrderItemSchema.parse({ ...orderItem, userId: session?.user.id! });
  try {
    const [o] =  await db
     .update(orderItems)
     .set({...newOrderItem, updatedAt: new Date() })
     .where(and(eq(orderItems.id, orderItemId!), eq(orderItems.userId, session?.user.id!)))
     .returning();
    return { orderItem: o };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteOrderItem = async (id: OrderItemId) => {
  const { session } = await getUserAuth();
  const { id: orderItemId } = orderItemIdSchema.parse({ id });
  try {
    const [o] =  await db.delete(orderItems).where(and(eq(orderItems.id, orderItemId!), eq(orderItems.userId, session?.user.id!)))
    .returning();
    return { orderItem: o };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};


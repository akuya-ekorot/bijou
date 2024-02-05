import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type OrderItemId, orderItemIdSchema, orderItems } from "@/lib/db/schema/orderItems";
import { orders } from "@/lib/db/schema/orders";
import { products } from "@/lib/db/schema/products";
import { shops } from "@/lib/db/schema/shops";

export const getOrderItems = async () => {
  const { session } = await getUserAuth();
  const o = await db.select({ orderItem: orderItems, order: orders, product: products, shop: shops }).from(orderItems).leftJoin(orders, eq(orderItems.orderId, orders.id)).leftJoin(products, eq(orderItems.productId, products.id)).leftJoin(shops, eq(orderItems.shopId, shops.id)).where(eq(orderItems.userId, session?.user.id!));
  return { orderItems: o };
};

export const getOrderItemById = async (id: OrderItemId) => {
  const { session } = await getUserAuth();
  const { id: orderItemId } = orderItemIdSchema.parse({ id });
  const [o] = await db.select({ orderItem: orderItems, order: orders, product: products, shop: shops }).from(orderItems).where(and(eq(orderItems.id, orderItemId), eq(orderItems.userId, session?.user.id!))).leftJoin(orders, eq(orderItems.orderId, orders.id)).leftJoin(products, eq(orderItems.productId, products.id)).leftJoin(shops, eq(orderItems.shopId, shops.id));
  return { orderItem: o };
};


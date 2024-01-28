import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import {
  ShopId,
  NewShopParams,
  UpdateShopParams,
  updateShopSchema,
  insertShopSchema,
  shops,
  shopIdSchema,
} from "@/lib/db/schema/shops";
import { getUserAuth } from "@/lib/auth/utils";

export const createShop = async (shop: NewShopParams) => {
  const { session } = await getUserAuth();
  const newShop = insertShopSchema.parse({
    ...shop,
    userId: session?.user.id!,
  });
  try {
    const [s] = await db.insert(shops).values(newShop).returning();
    return { shop: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateShop = async (id: ShopId, shop: UpdateShopParams) => {
  const { session } = await getUserAuth();
  const { id: shopId } = shopIdSchema.parse({ id });
  const newShop = updateShopSchema.parse({
    ...shop,
    userId: session?.user.id!,
  });
  try {
    const [s] = await db
      .update(shops)
      .set({ ...newShop, updatedAt: new Date() })
      .where(and(eq(shops.id, shopId!), eq(shops.userId, session?.user.id!)))
      .returning();
    return { shop: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteShop = async (id: ShopId) => {
  const { session } = await getUserAuth();
  const { id: shopId } = shopIdSchema.parse({ id });
  try {
    const [s] = await db
      .delete(shops)
      .where(and(eq(shops.id, shopId!), eq(shops.userId, session?.user.id!)))
      .returning();
    return { shop: s };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

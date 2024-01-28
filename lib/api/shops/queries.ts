import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ShopId, shopIdSchema, shops } from "@/lib/db/schema/shops";

export const getShops = async () => {
  const { session } = await getUserAuth();
  const s = await db.select().from(shops).where(eq(shops.userId, session?.user.id!));
  return { shops: s };
};

export const getShopById = async (id: ShopId) => {
  const { session } = await getUserAuth();
  const { id: shopId } = shopIdSchema.parse({ id });
  const [s] = await db.select().from(shops).where(and(eq(shops.id, shopId), eq(shops.userId, session?.user.id!)));
  return { shop: s };
};


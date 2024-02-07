import { db } from '@/lib/db/index';
import { and, eq } from 'drizzle-orm';
import {
  HeroId,
  NewHeroParams,
  UpdateHeroParams,
  updateHeroSchema,
  insertHeroSchema,
  heroes,
  heroIdSchema,
} from '@/lib/db/schema/heroes';
import { getUserAuth } from '@/lib/auth/utils';

export const createHero = async (hero: NewHeroParams) => {
  const { session } = await getUserAuth();
  const newHero = insertHeroSchema.parse({
    ...hero,
    userId: session?.user.id!,
  });
  try {
    const [h] = await db.insert(heroes).values(newHero).returning();
    return { hero: h };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const updateHero = async (id: HeroId, hero: UpdateHeroParams) => {
  const { session } = await getUserAuth();
  const { id: heroId } = heroIdSchema.parse({ id });
  const newHero = updateHeroSchema.parse({
    ...hero,
    userId: session?.user.id!,
  });
  try {
    const [h] = await db
      .update(heroes)
      .set({ ...newHero, updatedAt: new Date() })
      .where(and(eq(heroes.id, heroId!), eq(heroes.userId, session?.user.id!)))
      .returning();
    return { hero: h };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

export const deleteHero = async (id: HeroId) => {
  const { session } = await getUserAuth();
  const { id: heroId } = heroIdSchema.parse({ id });
  try {
    const [h] = await db
      .delete(heroes)
      .where(and(eq(heroes.id, heroId!), eq(heroes.userId, session?.user.id!)))
      .returning();
    return { hero: h };
  } catch (err) {
    const message = (err as Error).message ?? 'Error, please try again';
    console.error(message);
    throw { error: message };
  }
};

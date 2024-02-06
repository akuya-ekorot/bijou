import { db } from '@/lib/db/index';
import { eq, and } from 'drizzle-orm';
import { getUserAuth } from '@/lib/auth/utils';
import { type HeroId, heroIdSchema, heroes } from '@/lib/db/schema/heroes';

export const getHeroes = async () => {
  const { session } = await getUserAuth();

  const rows = await db
    .select()
    .from(heroes)
    .where(eq(heroes.userId, session?.user.id!));
  const h = rows;
  return { heroes: h };
};

export const getHeroById = async (id: HeroId) => {
  const { session } = await getUserAuth();

  const { id: heroId } = heroIdSchema.parse({ id });
  const [row] = await db
    .select()
    .from(heroes)
    .where(and(eq(heroes.id, heroId), eq(heroes.userId, session?.user.id!)));
  if (row === undefined) return {};
  const h = row;
  return { hero: h };
};

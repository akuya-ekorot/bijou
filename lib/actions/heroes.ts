'use server';

import { revalidatePath } from 'next/cache';
import { createHero, deleteHero, updateHero } from '@/lib/api/heroes/mutations';
import {
  HeroId,
  NewHeroParams,
  UpdateHeroParams,
  heroIdSchema,
  insertHeroParams,
  updateHeroParams,
} from '@/lib/db/schema/heroes';

const handleErrors = (e: unknown) => {
  const errMsg = 'Error, please try again.';
  if (e instanceof Error) return e.message.length > 0 ? e.message : errMsg;
  if (e && typeof e === 'object' && 'error' in e) {
    const errAsStr = e.error as string;
    return errAsStr.length > 0 ? errAsStr : errMsg;
  }
  return errMsg;
};

const revalidateHeroes = () => revalidatePath('/heroes');

export const createHeroAction = async (input: NewHeroParams) => {
  try {
    const payload = insertHeroParams.parse(input);
    await createHero(payload);
    revalidateHeroes();
  } catch (e) {
    return handleErrors(e);
  }
};

export const updateHeroAction = async (input: UpdateHeroParams) => {
  try {
    const payload = updateHeroParams.parse(input);
    await updateHero(payload.id, payload);
    revalidateHeroes();
  } catch (e) {
    return handleErrors(e);
  }
};

export const deleteHeroAction = async (input: HeroId) => {
  try {
    const payload = heroIdSchema.parse({ id: input });
    await deleteHero(payload.id);
    revalidateHeroes();
  } catch (e) {
    return handleErrors(e);
  }
};

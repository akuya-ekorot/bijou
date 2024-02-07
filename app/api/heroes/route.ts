import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createHero, deleteHero, updateHero } from '@/lib/api/heroes/mutations';
import {
  heroIdSchema,
  insertHeroParams,
  updateHeroParams,
} from '@/lib/db/schema/heroes';

export async function POST(req: Request) {
  try {
    const validatedData = insertHeroParams.parse(await req.json());
    const { hero } = await createHero(validatedData);

    revalidatePath('/heroes'); // optional - assumes you will have named route same as entity

    return NextResponse.json(hero, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json({ error: err }, { status: 500 });
    }
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const validatedData = updateHeroParams.parse(await req.json());
    const validatedParams = heroIdSchema.parse({ id });

    const { hero } = await updateHero(validatedParams.id, validatedData);

    return NextResponse.json(hero, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const validatedParams = heroIdSchema.parse({ id });
    const { hero } = await deleteHero(validatedParams.id);

    return NextResponse.json(hero, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

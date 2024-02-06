import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createCollection,
  deleteCollection,
  updateCollection,
} from '@/lib/api/collections/mutations';
import {
  collectionIdSchema,
  insertCollectionParams,
  updateCollectionParams,
} from '@/lib/db/schema/collections';

export async function POST(req: Request) {
  try {
    const validatedData = insertCollectionParams.parse(await req.json());
    const { collection } = await createCollection(validatedData);

    revalidatePath('/collections'); // optional - assumes you will have named route same as entity

    return NextResponse.json(collection, { status: 201 });
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

    const validatedData = updateCollectionParams.parse(await req.json());
    const validatedParams = collectionIdSchema.parse({ id });

    const { collection } = await updateCollection(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(collection, { status: 200 });
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

    const validatedParams = collectionIdSchema.parse({ id });
    const { collection } = await deleteCollection(validatedParams.id);

    return NextResponse.json(collection, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

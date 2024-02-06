import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createCollectionImage,
  deleteCollectionImage,
  updateCollectionImage,
} from '@/lib/api/collectionImages/mutations';
import {
  collectionImageIdSchema,
  insertCollectionImageParams,
  updateCollectionImageParams,
} from '@/lib/db/schema/collectionImages';

export async function POST(req: Request) {
  try {
    const validatedData = insertCollectionImageParams.parse(await req.json());
    const { collectionImage } = await createCollectionImage(validatedData);

    revalidatePath('/collectionImages'); // optional - assumes you will have named route same as entity

    return NextResponse.json(collectionImage, { status: 201 });
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

    const validatedData = updateCollectionImageParams.parse(await req.json());
    const validatedParams = collectionImageIdSchema.parse({ id });

    const { collectionImage } = await updateCollectionImage(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(collectionImage, { status: 200 });
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

    const validatedParams = collectionImageIdSchema.parse({ id });
    const { collectionImage } = await deleteCollectionImage(validatedParams.id);

    return NextResponse.json(collectionImage, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

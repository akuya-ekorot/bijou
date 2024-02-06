import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createCollectionProduct,
  deleteCollectionProduct,
  updateCollectionProduct,
} from '@/lib/api/collectionProducts/mutations';
import {
  collectionProductIdSchema,
  insertCollectionProductParams,
  updateCollectionProductParams,
} from '@/lib/db/schema/collectionProducts';

export async function POST(req: Request) {
  try {
    const validatedData = insertCollectionProductParams.parse(await req.json());
    const { collectionProduct } = await createCollectionProduct(validatedData);

    revalidatePath('/collectionProducts'); // optional - assumes you will have named route same as entity

    return NextResponse.json(collectionProduct, { status: 201 });
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

    const validatedData = updateCollectionProductParams.parse(await req.json());
    const validatedParams = collectionProductIdSchema.parse({ id });

    const { collectionProduct } = await updateCollectionProduct(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(collectionProduct, { status: 200 });
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

    const validatedParams = collectionProductIdSchema.parse({ id });
    const { collectionProduct } = await deleteCollectionProduct(
      validatedParams.id,
    );

    return NextResponse.json(collectionProduct, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

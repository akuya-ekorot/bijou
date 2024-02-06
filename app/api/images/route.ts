import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createImage,
  deleteImage,
  updateImage,
} from '@/lib/api/images/mutations';
import {
  imageIdSchema,
  insertImageParams,
  updateImageParams,
} from '@/lib/db/schema/images';

export async function POST(req: Request) {
  try {
    const validatedData = insertImageParams.parse(await req.json());
    const { image } = await createImage(validatedData);

    revalidatePath('/images'); // optional - assumes you will have named route same as entity

    return NextResponse.json(image, { status: 201 });
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

    const validatedData = updateImageParams.parse(await req.json());
    const validatedParams = imageIdSchema.parse({ id });

    const { image } = await updateImage(validatedParams.id, validatedData);

    return NextResponse.json(image, { status: 200 });
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

    const validatedParams = imageIdSchema.parse({ id });
    const { image } = await deleteImage(validatedParams.id);

    return NextResponse.json(image, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createProductImage,
  deleteProductImage,
  updateProductImage,
} from '@/lib/api/productImages/mutations';
import {
  productImageIdSchema,
  insertProductImageParams,
  updateProductImageParams,
} from '@/lib/db/schema/productImages';

export async function POST(req: Request) {
  try {
    const validatedData = insertProductImageParams.parse(await req.json());
    const { productImage } = await createProductImage(validatedData);

    revalidatePath('/productImages'); // optional - assumes you will have named route same as entity

    return NextResponse.json(productImage, { status: 201 });
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

    const validatedData = updateProductImageParams.parse(await req.json());
    const validatedParams = productImageIdSchema.parse({ id });

    const { productImage } = await updateProductImage(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(productImage, { status: 200 });
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

    const validatedParams = productImageIdSchema.parse({ id });
    const { productImage } = await deleteProductImage(validatedParams.id);

    return NextResponse.json(productImage, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

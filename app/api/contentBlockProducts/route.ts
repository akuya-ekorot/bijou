import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContentBlockProduct,
  deleteContentBlockProduct,
  updateContentBlockProduct,
} from "@/lib/api/contentBlockProducts/mutations";
import { 
  contentBlockProductIdSchema,
  insertContentBlockProductParams,
  updateContentBlockProductParams 
} from "@/lib/db/schema/contentBlockProducts";

export async function POST(req: Request) {
  try {
    const validatedData = insertContentBlockProductParams.parse(await req.json());
    const { contentBlockProduct } = await createContentBlockProduct(validatedData);

    revalidatePath("/contentBlockProducts"); // optional - assumes you will have named route same as entity

    return NextResponse.json(contentBlockProduct, { status: 201 });
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
    const id = searchParams.get("id");

    const validatedData = updateContentBlockProductParams.parse(await req.json());
    const validatedParams = contentBlockProductIdSchema.parse({ id });

    const { contentBlockProduct } = await updateContentBlockProduct(validatedParams.id, validatedData);

    return NextResponse.json(contentBlockProduct, { status: 200 });
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
    const id = searchParams.get("id");

    const validatedParams = contentBlockProductIdSchema.parse({ id });
    const { contentBlockProduct } = await deleteContentBlockProduct(validatedParams.id);

    return NextResponse.json(contentBlockProduct, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

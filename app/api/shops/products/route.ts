import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/api/products/mutations";
import { 
  productIdSchema,
  insertProductParams,
  updateProductParams 
} from "@/lib/db/schema/products";

export async function POST(req: Request) {
  try {
    const validatedData = insertProductParams.parse(await req.json());
    const { product } = await createProduct(validatedData);

    revalidatePath("/products"); // optional - assumes you will have named route same as entity

    return NextResponse.json(product, { status: 201 });
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

    const validatedData = updateProductParams.parse(await req.json());
    const validatedParams = productIdSchema.parse({ id });

    const { product } = await updateProduct(validatedParams.id, validatedData);

    return NextResponse.json(product, { status: 200 });
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

    const validatedParams = productIdSchema.parse({ id });
    const { product } = await deleteProduct(validatedParams.id);

    return NextResponse.json(product, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

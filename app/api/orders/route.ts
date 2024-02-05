import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createOrder,
  deleteOrder,
  updateOrder,
} from "@/lib/api/orders/mutations";
import { 
  orderIdSchema,
  insertOrderParams,
  updateOrderParams 
} from "@/lib/db/schema/orders";

export async function POST(req: Request) {
  try {
    const validatedData = insertOrderParams.parse(await req.json());
    const { order } = await createOrder(validatedData);

    revalidatePath("/orders"); // optional - assumes you will have named route same as entity

    return NextResponse.json(order, { status: 201 });
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

    const validatedData = updateOrderParams.parse(await req.json());
    const validatedParams = orderIdSchema.parse({ id });

    const { order } = await updateOrder(validatedParams.id, validatedData);

    return NextResponse.json(order, { status: 200 });
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

    const validatedParams = orderIdSchema.parse({ id });
    const { order } = await deleteOrder(validatedParams.id);

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

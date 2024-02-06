import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createOrderItem,
  deleteOrderItem,
  updateOrderItem,
} from '@/lib/api/orderItems/mutations';
import {
  orderItemIdSchema,
  insertOrderItemParams,
  updateOrderItemParams,
} from '@/lib/db/schema/orderItems';

export async function POST(req: Request) {
  try {
    const validatedData = insertOrderItemParams.parse(await req.json());
    const { orderItem } = await createOrderItem(validatedData);

    revalidatePath('/orderItems'); // optional - assumes you will have named route same as entity

    return NextResponse.json(orderItem, { status: 201 });
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

    const validatedData = updateOrderItemParams.parse(await req.json());
    const validatedParams = orderItemIdSchema.parse({ id });

    const { orderItem } = await updateOrderItem(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(orderItem, { status: 200 });
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

    const validatedParams = orderItemIdSchema.parse({ id });
    const { orderItem } = await deleteOrderItem(validatedParams.id);

    return NextResponse.json(orderItem, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

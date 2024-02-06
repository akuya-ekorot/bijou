import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createPayment,
  deletePayment,
  updatePayment,
} from '@/lib/api/payments/mutations';
import {
  paymentIdSchema,
  insertPaymentParams,
  updatePaymentParams,
} from '@/lib/db/schema/payments';

export async function POST(req: Request) {
  try {
    const validatedData = insertPaymentParams.parse(await req.json());
    const { payment } = await createPayment(validatedData);

    revalidatePath('/payments'); // optional - assumes you will have named route same as entity

    return NextResponse.json(payment, { status: 201 });
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

    const validatedData = updatePaymentParams.parse(await req.json());
    const validatedParams = paymentIdSchema.parse({ id });

    const { payment } = await updatePayment(validatedParams.id, validatedData);

    return NextResponse.json(payment, { status: 200 });
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

    const validatedParams = paymentIdSchema.parse({ id });
    const { payment } = await deletePayment(validatedParams.id);

    return NextResponse.json(payment, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

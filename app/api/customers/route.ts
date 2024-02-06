import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from '@/lib/api/customers/mutations';
import {
  customerIdSchema,
  insertCustomerParams,
  updateCustomerParams,
} from '@/lib/db/schema/customers';

export async function POST(req: Request) {
  try {
    const validatedData = insertCustomerParams.parse(await req.json());
    const { customer } = await createCustomer(validatedData);

    revalidatePath('/customers'); // optional - assumes you will have named route same as entity

    return NextResponse.json(customer, { status: 201 });
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

    const validatedData = updateCustomerParams.parse(await req.json());
    const validatedParams = customerIdSchema.parse({ id });

    const { customer } = await updateCustomer(
      validatedParams.id,
      validatedData,
    );

    return NextResponse.json(customer, { status: 200 });
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

    const validatedParams = customerIdSchema.parse({ id });
    const { customer } = await deleteCustomer(validatedParams.id);

    return NextResponse.json(customer, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

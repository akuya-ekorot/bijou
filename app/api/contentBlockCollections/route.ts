import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContentBlockCollection,
  deleteContentBlockCollection,
  updateContentBlockCollection,
} from "@/lib/api/contentBlockCollections/mutations";
import { 
  contentBlockCollectionIdSchema,
  insertContentBlockCollectionParams,
  updateContentBlockCollectionParams 
} from "@/lib/db/schema/contentBlockCollections";

export async function POST(req: Request) {
  try {
    const validatedData = insertContentBlockCollectionParams.parse(await req.json());
    const { contentBlockCollection } = await createContentBlockCollection(validatedData);

    revalidatePath("/contentBlockCollections"); // optional - assumes you will have named route same as entity

    return NextResponse.json(contentBlockCollection, { status: 201 });
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

    const validatedData = updateContentBlockCollectionParams.parse(await req.json());
    const validatedParams = contentBlockCollectionIdSchema.parse({ id });

    const { contentBlockCollection } = await updateContentBlockCollection(validatedParams.id, validatedData);

    return NextResponse.json(contentBlockCollection, { status: 200 });
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

    const validatedParams = contentBlockCollectionIdSchema.parse({ id });
    const { contentBlockCollection } = await deleteContentBlockCollection(validatedParams.id);

    return NextResponse.json(contentBlockCollection, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

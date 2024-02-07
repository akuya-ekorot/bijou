import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createContentBlock,
  deleteContentBlock,
  updateContentBlock,
} from "@/lib/api/contentBlocks/mutations";
import { 
  contentBlockIdSchema,
  insertContentBlockParams,
  updateContentBlockParams 
} from "@/lib/db/schema/contentBlocks";

export async function POST(req: Request) {
  try {
    const validatedData = insertContentBlockParams.parse(await req.json());
    const { contentBlock } = await createContentBlock(validatedData);

    revalidatePath("/contentBlocks"); // optional - assumes you will have named route same as entity

    return NextResponse.json(contentBlock, { status: 201 });
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

    const validatedData = updateContentBlockParams.parse(await req.json());
    const validatedParams = contentBlockIdSchema.parse({ id });

    const { contentBlock } = await updateContentBlock(validatedParams.id, validatedData);

    return NextResponse.json(contentBlock, { status: 200 });
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

    const validatedParams = contentBlockIdSchema.parse({ id });
    const { contentBlock } = await deleteContentBlock(validatedParams.id);

    return NextResponse.json(contentBlock, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    } else {
      return NextResponse.json(err, { status: 500 });
    }
  }
}

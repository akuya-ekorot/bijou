import { db } from "@/lib/db/index";
import { and, eq } from "drizzle-orm";
import {
  ImageId,
  NewImageParams,
  UpdateImageParams,
  updateImageSchema,
  insertImageSchema,
  images,
  imageIdSchema,
} from "@/lib/db/schema/images";
import { getUserAuth } from "@/lib/auth/utils";

export const createImage = async (image: NewImageParams) => {
  const { session } = await getUserAuth();
  const newImage = insertImageSchema.parse({
    ...image,
    userId: session?.user.id!,
  });
  try {
    const [i] = await db.insert(images).values(newImage).returning();
    return { image: i };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const updateImage = async (id: ImageId, image: UpdateImageParams) => {
  const { session } = await getUserAuth();
  const { id: imageId } = imageIdSchema.parse({ id });
  const newImage = updateImageSchema.parse({
    ...image,
    userId: session?.user.id!,
  });
  try {
    const [i] = await db
      .update(images)
      .set({ ...newImage, updatedAt: new Date() })
      .where(and(eq(images.id, imageId!), eq(images.userId, session?.user.id!)))
      .returning();
    return { image: i };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

export const deleteImage = async (id: ImageId) => {
  const { session } = await getUserAuth();
  const { id: imageId } = imageIdSchema.parse({ id });
  try {
    const [i] = await db
      .delete(images)
      .where(and(eq(images.id, imageId!), eq(images.userId, session?.user.id!)))
      .returning();
    return { image: i };
  } catch (err) {
    const message = (err as Error).message ?? "Error, please try again";
    console.error(message);
    throw { error: message };
  }
};

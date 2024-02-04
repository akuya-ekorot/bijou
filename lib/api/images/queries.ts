import { db } from "@/lib/db/index";
import { eq, and } from "drizzle-orm";
import { getUserAuth } from "@/lib/auth/utils";
import { type ImageId, imageIdSchema, images } from "@/lib/db/schema/images";

export const getImages = async () => {
  const { session } = await getUserAuth();
  const i = await db.select().from(images).where(eq(images.userId, session?.user.id!));
  return { images: i };
};

export const getImageById = async (id: ImageId) => {
  const { session } = await getUserAuth();
  const { id: imageId } = imageIdSchema.parse({ id });
  const [i] = await db.select().from(images).where(and(eq(images.id, imageId), eq(images.userId, session?.user.id!)));
  return { image: i };
};


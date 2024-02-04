import { getImageById, getImages } from "@/lib/api/images/queries";
import { publicProcedure, router } from "@/lib/server/trpc";
import {
  imageIdSchema,
  insertImageParams,
  updateImageParams,
} from "@/lib/db/schema/images";
import { createImage, deleteImage, updateImage } from "@/lib/api/images/mutations";

export const imagesRouter = router({
  getImages: publicProcedure.query(async () => {
    return getImages();
  }),
  getImageById: publicProcedure.input(imageIdSchema).query(async ({ input }) => {
    return getImageById(input.id);
  }),
  createImage: publicProcedure
    .input(insertImageParams)
    .mutation(async ({ input }) => {
      return createImage(input);
    }),
  updateImage: publicProcedure
    .input(updateImageParams)
    .mutation(async ({ input }) => {
      return updateImage(input.id, input);
    }),
  deleteImage: publicProcedure
    .input(imageIdSchema)
    .mutation(async ({ input }) => {
      return deleteImage(input.id);
    }),
});

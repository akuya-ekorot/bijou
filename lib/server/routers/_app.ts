import { computersRouter } from "./computers";
import { router } from "@/lib/server/trpc";
import { imagesRouter } from "./images";

export const appRouter = router({
  computers: computersRouter,
  images: imagesRouter,
});

export type AppRouter = typeof appRouter;

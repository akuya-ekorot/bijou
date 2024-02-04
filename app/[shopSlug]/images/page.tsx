import ImageList from "@/components/images/ImageList";
import NewImageModal from "@/components/images/ImageModal";
import { api } from "@/lib/trpc/api";
import { checkAuth } from "@/lib/auth/utils";

export default async function Images() {
  await checkAuth();
  const { images } = await api.images.getImages.query();

  return (
    <main>
      <div className="flex justify-between">
        <h1 className="font-semibold text-2xl my-2">Images</h1>
        <NewImageModal />
      </div>
      <ImageList images={images} />
    </main>
  );
}

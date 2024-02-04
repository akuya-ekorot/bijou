"use client";
import { CompleteImage } from "@/lib/db/schema/images";
import { trpc } from "@/lib/trpc/client";
import ImageModal from "./ImageModal";


export default function ImageList({ images }: { images: CompleteImage[] }) {
  const { data: i } = trpc.images.getImages.useQuery(undefined, {
    initialData: { images },
    refetchOnMount: false,
  });

  if (i.images.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul>
      {i.images.map((image) => (
        <Image image={image} key={image.id} />
      ))}
    </ul>
  );
}

const Image = ({ image }: { image: CompleteImage }) => {
  return (
    <li className="flex justify-between my-2">
      <div className="w-full">
        <div>{image.url}</div>
      </div>
      <ImageModal image={image} />
    </li>
  );
};

const EmptyState = () => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No images
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new image.
      </p>
      <div className="mt-6">
        <ImageModal emptyState={true} />
      </div>
    </div>
  );
};


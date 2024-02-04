"use client";

import { useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { type TImage, CompleteImage } from "@/lib/db/schema/images";
import Modal from "@/components/shared/Modal";

import { useOptimisticImages } from "@/app/[shopSlug]/images/useOptimisticImages";
import { Button } from "@/components/ui/button";
import ImageForm from "./ImageForm";
import { PlusIcon } from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";

type TOpenModal = (image?: TImage) => void;

export default function ImageList({ images }: { images: CompleteImage[] }) {
  const { optimisticImages, addOptimisticImage } = useOptimisticImages(images);
  const [open, setOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<TImage | null>(null);
  const openModal = (image?: TImage) => {
    setOpen(true);
    image ? setActiveImage(image) : setActiveImage(null);
  };
  const closeModal = () => setOpen(false);

  return (
    <div>
      <Modal
        open={open}
        setOpen={setOpen}
        title={activeImage ? "Edit Image" : "Create Images"}
      >
        <ImageForm
          image={activeImage}
          addOptimistic={addOptimisticImage}
          openModal={openModal}
          closeModal={closeModal}
        />
      </Modal>
      <div className="absolute right-0 top-0 ">
        <Button onClick={() => openModal()} variant={"outline"}>
          +
        </Button>
      </div>
      {optimisticImages.length === 0 ? (
        <EmptyState openModal={openModal} />
      ) : (
        <ul>
          <ImageGrid images={optimisticImages} openModal={openModal} />
        </ul>
      )}
    </div>
  );
}

const ImageGrid = ({
  images,
  openModal,
}: {
  images: CompleteImage[];
  openModal: TOpenModal;
}) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageItem image={image} key={image.id} openModal={openModal} />
      ))}
    </div>
  );
};

const ImageItem = ({
  image,
  openModal,
}: {
  image: CompleteImage;
  openModal: TOpenModal;
}) => {
  const optimistic = image.id === "optimistic";
  const deleting = image.id === "delete";
  const mutating = optimistic || deleting;
  const params = useParams();

  return (
    <li
      className={cn(
        "flex flex-col",
        mutating ? "opacity-30 animate-pulse" : "",
        deleting ? "text-destructive" : "",
      )}
    >
      <div className="w-full">
        <Image
          className="w-full"
          src={image.url}
          alt={image.url}
          height={280}
          width={280}
        />
      </div>
      <Button variant={"link"} asChild>
        <Link href={`/${params.shopSlug}/images/` + image.id}>Edit</Link>
      </Button>
    </li>
  );
};

const EmptyState = ({ openModal }: { openModal: TOpenModal }) => {
  return (
    <div className="text-center">
      <h3 className="mt-2 text-sm font-semibold text-secondary-foreground">
        No images
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating a new image.
      </p>
      <div className="mt-6">
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4" /> New Images{" "}
        </Button>
      </div>
    </div>
  );
};

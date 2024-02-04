"use client";

import { useOptimistic, useState } from "react";
import { TAddOptimistic } from "@/app/[shopSlug]/images/useOptimisticImages";
import { type TImage } from "@/lib/db/schema/images";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import Modal from "@/components/shared/Modal";
import ImageForm from "@/components/images/ImageForm";

export default function OptimisticImage({ image }: { image: TImage }) {
  const [open, setOpen] = useState(false);
  const openModal = (_?: TImage) => {
    setOpen(true);
  };
  const closeModal = () => setOpen(false);
  const [optimisticImage, setOptimisticImage] = useOptimistic(image);
  const updateImage: TAddOptimistic = (input) =>
    setOptimisticImage({ ...input.data });

  return (
    <div className="m-4">
      <Modal open={open} setOpen={setOpen}>
        <ImageForm
          image={image}
          closeModal={closeModal}
          openModal={openModal}
          addOptimistic={updateImage}
        />
      </Modal>
      <div className="flex justify-between items-end mb-4">
        <h1 className="font-semibold text-2xl">{image.url}</h1>
        <Button className="" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </div>
      <pre
        className={cn(
          "bg-secondary p-4 rounded-lg break-all text-wrap",
          optimisticImage.id === "optimistic" ? "animate-pulse" : "",
        )}
      >
        {JSON.stringify(optimisticImage, null, 2)}
      </pre>
    </div>
  );
}

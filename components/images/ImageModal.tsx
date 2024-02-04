"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import ImageForm from "./ImageForm";
import { Image } from "@/lib/db/schema/images";

export default function ImageModal({
  image,
  emptyState,
}: {
  image?: Image;
  emptyState?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const closeModal = () => setOpen(false);
  const editing = !!image?.id;

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        {emptyState ? (
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            New Image
          </Button>
        ) : (
          <Button
            variant={editing ? "ghost" : "outline"}
            size={editing ? "sm" : "icon"}
          >
            {editing ? "Edit" : "+"}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="px-5 pt-5">
          <SheetTitle>{editing ? "Edit" : "Create"} Image</SheetTitle>
        </SheetHeader>
        <div className="px-5 pb-5">
          <ImageForm closeModal={closeModal} image={image} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

"use client";

import { Image, NewImageParams, insertImageParams } from "@/lib/db/schema/images";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

const ImageForm = ({
  image,
  closeModal,
}: {
  image?: Image;
  closeModal?: () => void;
}) => {
  const { toast } = useToast();
  
  const editing = !!image?.id;

  const router = useRouter();
  const utils = trpc.useContext();

  const form = useForm<z.infer<typeof insertImageParams>>({
    // latest Zod release has introduced a TS error with zodResolver
    // open issue: https://github.com/colinhacks/zod/issues/2663
    // errors locally but not in production
    resolver: zodResolver(insertImageParams),
    defaultValues: image ?? {
      url: ""
    },
  });

  const onSuccess = async (action: "create" | "update" | "delete",
    data?: { error?: string },
  ) => {
        if (data?.error) {
      toast({
        title: `${action
          .slice(0, 1)
          .toUpperCase()
          .concat(action.slice(1))} Failed`,
        description: data.error,
        variant: "destructive",
      });
      return;
    }

    await utils.images.getImages.invalidate();
    router.refresh();
    if (closeModal) closeModal();
        toast({
      title: 'Success',
      description: `Image ${action}d!`,
      variant: "default",
    });
  };

  const { mutate: createImage, isLoading: isCreating } =
    trpc.images.createImage.useMutation({
      onSuccess: (res) => onSuccess("create"),
    });

  const { mutate: updateImage, isLoading: isUpdating } =
    trpc.images.updateImage.useMutation({
      onSuccess: (res) => onSuccess("update"),
    });

  const { mutate: deleteImage, isLoading: isDeleting } =
    trpc.images.deleteImage.useMutation({
      onSuccess: (res) => onSuccess("delete"),
    });

  const handleSubmit = (values: NewImageParams) => {
    if (editing) {
      updateImage({ ...values, id: image.id });
    } else {
      createImage(values);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={"space-y-8"}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (<FormItem>
              <FormLabel>Url</FormLabel>
                <FormControl>
            <Input {...field} />
          </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="mr-1"
          disabled={isCreating || isUpdating}
        >
          {editing
            ? `Sav${isUpdating ? "ing..." : "e"}`
            : `Creat${isCreating ? "ing..." : "e"}`}
        </Button>
        {editing ? (
          <Button
            type="button"
            variant={"destructive"}
            onClick={() => deleteImage({ id: image.id })}
          >
            Delet{isDeleting ? "ing..." : "e"}
          </Button>
        ) : null}
      </form>
    </Form>
  );
};

export default ImageForm;

import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/[shopSlug]/products/useOptimisticProducts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  type Product,
  insertProductParams,
  CompleteProduct,
} from "@/lib/db/schema/products";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/lib/actions/products";
import { upload } from "@/lib/api/upload";
import { insertMultipleImagesParams } from "@/lib/db/schema/images";
import { createImageAction } from "@/lib/actions/images";
import { createProductImageAction } from "@/lib/actions/productImages";
import { Collection, CompleteCollection } from "@/lib/db/schema/collections";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "../ui/command";
import { createCollectionProductAction } from "@/lib/actions/collectionProducts";

const ProductForm = ({
  collections,
  product,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  collections: Array<CompleteCollection>;
  product?: CompleteProduct | null;
  openModal?: (product?: CompleteProduct) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } = useValidatedForm<
    Product & { images: FileList | null; collections: Array<Collection> }
  >(insertProductParams);
  const { toast } = useToast();
  const editing = !!product?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: CompleteProduct },
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
    } else {
      router.refresh();
      postSuccess && postSuccess();
    }

    toast({
      title: failed ? `Failed to ${action}` : "Success",
      description: failed ? data?.error ?? "Error" : `Product ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (
    {
      images,
      collections,
    }: { collections: Array<Collection>; images: FileList | null },
    data: FormData,
  ) => {
    setErrors(null);

    const imageIds: Array<{ id: string }> = [];

    //TODO: upload image if not null
    if (images) {
      const { data: uploadData, error: uploadError } = await upload(images);

      if (uploadError || !uploadData) {
        setErrors({ images: [uploadError ?? "error uploading images"] });
        return;
      }

      const imageParsed = await insertMultipleImagesParams.safeParseAsync(
        uploadData.urls,
      );

      if (!imageParsed.success) {
        console.log(imageParsed.error);
        setErrors({ images: ["Error parsing image data"] });
        return;
      }

      for (const parsedImage of imageParsed.data) {
        const { error, image } = await createImageAction(parsedImage);

        if (error || !image) {
          setErrors({ images: [error ?? "Error creating image records"] });
          return;
        }

        imageIds.push({ id: image.image.id });
      }
    }

    const payload = Object.fromEntries(data.entries());
    console.log("payload", payload);
    const productParsed = await insertProductParams.safeParseAsync(payload);
    if (!productParsed.success) {
      setErrors(productParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = productParsed.data;
    const pendingImages = imageIds.map((image) => ({
      ...image,
      url: "",
      userId: product?.userId ?? "",
      updatedAt: product?.updatedAt ?? new Date(),
      createdAt: product?.createdAt ?? new Date(),
    }));

    const pendingProduct: CompleteProduct = {
      updatedAt: product?.updatedAt ?? new Date(),
      createdAt: product?.createdAt ?? new Date(),
      id: product?.id ?? "",
      userId: product?.userId ?? "",
      collections: product?.collections ?? [],
      images: pendingImages,
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingProduct,
            action: editing ? "update" : "create",
          });

        const { product: newProduct, error } = editing
          ? await updateProductAction({ ...values, id: product.id })
          : await createProductAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingProduct,
        };

        if (error || !newProduct) {
          onSuccess(
            editing ? "update" : "create",
            error ? errorFormatted : undefined,
          );
          return;
        }

        let order = 0;

        //TODO: create collection image record
        for (const imageId of imageIds) {
          const imageError = await createProductImageAction({
            productId: newProduct.product.id,
            imageId: imageId.id,
            order,
          });

          if (imageError) {
            setErrors({ images: [imageError] });
            return;
          }

          order++;
        }

        //TODO: create product collection record
        for (const collection of collections) {
          const collectionError = await createCollectionProductAction({
            productId: newProduct.product.id,
            collectionId: collection.id,
          });

          if (collectionError) {
            setErrors({ collections: [collectionError] });
            return;
          }
        }

        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined,
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  const [images, setImages] = useState<FileList | null>(null);
  const [productCollections, setProductCollections] = useState<
    Array<Collection>
  >(product?.collections ?? []);

  const [openCollectionCombobox, setOpenCollectionComobox] = useState(false);
  const [collectionSearch, setCollectionSearch] = useState("");

  const handleSelectCollection = (id: string) => {
    const collection = collections.find((c) => c.id === id);

    if (!collection) return;

    setProductCollections((prev) => {
      if (prev.find((c) => c.id === collection.id)) {
        return prev.filter((c) => c.id !== collection.id);
      }
      return [...prev, collection];
    });

    setOpenCollectionComobox(false);
  };

  const handleSubmitWrapper = handleSubmit.bind(null, {
    images,
    collections: productCollections,
  });
  return (
    <form
      action={handleSubmitWrapper}
      onChange={handleChange}
      className={"space-y-8"}
    >
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : "",
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={product?.name ?? ""}
        />
        {errors?.name ? (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.slug ? "text-destructive" : "",
          )}
        >
          Slug
        </Label>
        <Input
          type="text"
          name="slug"
          className={cn(errors?.slug ? "ring ring-destructive" : "")}
          defaultValue={product?.slug ?? ""}
        />
        {errors?.slug ? (
          <p className="text-xs text-destructive mt-2">{errors.slug[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : "",
          )}
        >
          Description
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={product?.description ?? ""}
        />
        {errors?.description ? (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.price ? "text-destructive" : "",
          )}
        >
          Price
        </Label>
        <Input
          type="number"
          min="0"
          name="price"
          className={cn(errors?.price ? "ring ring-destructive" : "")}
          defaultValue={product?.price ?? ""}
        />
        {errors?.price ? (
          <p className="text-xs text-destructive mt-2">{errors.price[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.images ? "text-destructive" : "",
          )}
        >
          Images
        </Label>
        <Input
          type="file"
          multiple
          name="images"
          className={cn(errors?.images ? "ring ring-destructive" : "")}
          onChange={(e) => {
            setImages(e.target.files);
          }}
        />
        {errors?.images ? (
          <p className="text-xs text-destructive mt-2">{errors.images[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.collections ? "text-destructive" : "",
          )}
        >
          Collections
        </Label>
        <div>
          <Popover
            open={openCollectionCombobox}
            onOpenChange={setOpenCollectionComobox}
          >
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox">
                Select Collections
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <Command>
                <CommandInput placeholder="Search collections..." />
                <CommandEmpty>No collection found.</CommandEmpty>
                <CommandGroup>
                  {collections.map((collection) => (
                    <CommandItem
                      key={collection.id}
                      value={collection.id}
                      onSelect={handleSelectCollection}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          productCollections.find((c) => c.id === collection.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {collection.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {errors?.collections ? (
          <p className="text-xs text-destructive mt-2">
            {errors.collections[0]}
          </p>
        ) : (
          <div className="h-6" />
        )}
      </div>

      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic &&
                addOptimistic({ action: "delete", data: product });
              const error = await deleteProductAction(product.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: product,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/products");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default ProductForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};

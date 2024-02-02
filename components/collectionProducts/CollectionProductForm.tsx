import { z } from "zod";

import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";

import { type TAddOptimistic } from "@/app/[shopSlug]/collection-products/useOptimisticCollectionProducts";
import { cn, type Action } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import {
	createCollectionProductAction,
	deleteCollectionProductAction,
	updateCollectionProductAction,
} from "@/lib/actions/collectionProducts";
import {
	insertCollectionProductParams,
	type CollectionProduct,
} from "@/lib/db/schema/collectionProducts";
import { type Collection } from "@/lib/db/schema/collections";
import { type Product } from "@/lib/db/schema/products";

const CollectionProductForm = ({
	collections,
	products,
	collectionProduct,
	openModal,
	closeModal,
	addOptimistic,
	postSuccess,
}: {
	collectionProduct?: CollectionProduct | null;
	collections: Collection[];
	products: Product[];
	openModal?: (collectionProduct?: CollectionProduct) => void;
	closeModal?: () => void;
	addOptimistic?: TAddOptimistic;
	postSuccess?: () => void;
}) => {
	const { errors, hasErrors, setErrors, handleChange } =
		useValidatedForm<CollectionProduct>(insertCollectionProductParams);
	const { toast } = useToast();
	const editing = !!collectionProduct?.id;

	const [isDeleting, setIsDeleting] = useState(false);
	const [pending, startMutation] = useTransition();

	const router = useRouter();

	const onSuccess = (
		action: Action,
		data?: { error: string; values: CollectionProduct }
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
			description: failed
				? data?.error ?? "Error"
				: `CollectionProduct ${action}d!`,
			variant: failed ? "destructive" : "default",
		});
	};

	const handleSubmit = async (data: FormData) => {
		setErrors(null);

		const payload = Object.fromEntries(data.entries());
		const collectionProductParsed =
			await insertCollectionProductParams.safeParseAsync(payload);
		if (!collectionProductParsed.success) {
			setErrors(collectionProductParsed?.error.flatten().fieldErrors);
			return;
		}

		closeModal && closeModal();
		const values = collectionProductParsed.data;
		const pendingCollectionProduct: CollectionProduct = {
			updatedAt: collectionProduct?.updatedAt ?? new Date(),
			createdAt: collectionProduct?.createdAt ?? new Date(),
			id: collectionProduct?.id ?? "",
			userId: collectionProduct?.userId ?? "",
			...values,
		};
		try {
			startMutation(async () => {
				addOptimistic &&
					addOptimistic({
						data: pendingCollectionProduct,
						action: editing ? "update" : "create",
					});

				const error = editing
					? await updateCollectionProductAction({
							...values,
							id: collectionProduct.id,
					  })
					: await createCollectionProductAction(values);

				const errorFormatted = {
					error: error ?? "Error",
					values: pendingCollectionProduct,
				};
				onSuccess(
					editing ? "update" : "create",
					error ? errorFormatted : undefined
				);
			});
		} catch (e) {
			if (e instanceof z.ZodError) {
				setErrors(e.flatten().fieldErrors);
			}
		}
	};

	return (
		<form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
			{/* Schema fields start */}

			<div>
				<Label
					className={cn(
						"mb-2 inline-block",
						errors?.collectionId ? "text-destructive" : ""
					)}
				>
					Collection
				</Label>
				<Select
					defaultValue={collectionProduct?.collectionId}
					name="collectionId"
				>
					<SelectTrigger
						className={cn(errors?.collectionId ? "ring ring-destructive" : "")}
					>
						<SelectValue placeholder="Select a collection" />
					</SelectTrigger>
					<SelectContent>
						{collections?.map((collection) => (
							<SelectItem key={collection.id} value={collection.id.toString()}>
								{collection.id}
								{/* TODO: Replace with a field from the collection model */}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors?.collectionId ? (
					<p className="text-xs text-destructive mt-2">
						{errors.collectionId[0]}
					</p>
				) : (
					<div className="h-6" />
				)}
			</div>

			<div>
				<Label
					className={cn(
						"mb-2 inline-block",
						errors?.productId ? "text-destructive" : ""
					)}
				>
					Product
				</Label>
				<Select defaultValue={collectionProduct?.productId} name="productId">
					<SelectTrigger
						className={cn(errors?.productId ? "ring ring-destructive" : "")}
					>
						<SelectValue placeholder="Select a product" />
					</SelectTrigger>
					<SelectContent>
						{products?.map((product) => (
							<SelectItem key={product.id} value={product.id.toString()}>
								{product.id}
								{/* TODO: Replace with a field from the product model */}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{errors?.productId ? (
					<p className="text-xs text-destructive mt-2">{errors.productId[0]}</p>
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
								addOptimistic({ action: "delete", data: collectionProduct });
							const error = await deleteCollectionProductAction(
								collectionProduct.id
							);
							setIsDeleting(false);
							const errorFormatted = {
								error: error ?? "Error",
								values: collectionProduct,
							};

							onSuccess("delete", error ? errorFormatted : undefined);
						});
						router.push("/collection-products");
					}}
				>
					Delet{isDeleting ? "ing..." : "e"}
				</Button>
			) : null}
		</form>
	);
};

export default CollectionProductForm;

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

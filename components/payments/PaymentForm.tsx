import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/[shopSlug]/payments/useOptimisticPayments";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { type Payment, insertPaymentParams } from "@/lib/db/schema/payments";
import {
  createPaymentAction,
  deletePaymentAction,
  updatePaymentAction,
} from "@/lib/actions/payments";

const PaymentForm = ({
  payment,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  payment?: Payment | null;

  openModal?: (payment?: Payment) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Payment>(insertPaymentParams);
  const { toast } = useToast();
  const editing = !!payment?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Payment },
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
      description: failed ? data?.error ?? "Error" : `Payment ${action}d!`,
      variant: failed ? "destructive" : "default",
    });
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());
    const paymentParsed = await insertPaymentParams.safeParseAsync(payload);
    if (!paymentParsed.success) {
      setErrors(paymentParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = paymentParsed.data;
    const pendingPayment: Payment = {
      updatedAt: payment?.updatedAt ?? new Date(),
      createdAt: payment?.createdAt ?? new Date(),
      id: payment?.id ?? "",
      userId: payment?.userId ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingPayment,
            action: editing ? "update" : "create",
          });

        const error = editing
          ? await updatePaymentAction({ ...values, id: payment.id })
          : await createPaymentAction(values);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingPayment,
        };
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

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-8"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.status ? "text-destructive" : "",
          )}
        >
          Status
        </Label>
        <Input
          type="text"
          name="status"
          className={cn(errors?.status ? "ring ring-destructive" : "")}
          defaultValue={payment?.status ?? ""}
        />
        {errors?.status ? (
          <p className="text-xs text-destructive mt-2">{errors.status[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.reference ? "text-destructive" : "",
          )}
        >
          Reference
        </Label>
        <Input
          type="text"
          name="reference"
          className={cn(errors?.reference ? "ring ring-destructive" : "")}
          defaultValue={payment?.reference ?? ""}
        />
        {errors?.reference ? (
          <p className="text-xs text-destructive mt-2">{errors.reference[0]}</p>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.amount ? "text-destructive" : "",
          )}
        >
          Amount
        </Label>
        <Input
          type="text"
          name="amount"
          className={cn(errors?.amount ? "ring ring-destructive" : "")}
          defaultValue={payment?.amount ?? ""}
        />
        {errors?.amount ? (
          <p className="text-xs text-destructive mt-2">{errors.amount[0]}</p>
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
                addOptimistic({ action: "delete", data: payment });
              const error = await deletePaymentAction(payment.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: payment,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
            router.push("/payments");
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default PaymentForm;

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

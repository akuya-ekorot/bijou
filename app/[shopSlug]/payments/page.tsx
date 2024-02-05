import { Suspense } from "react";

import Loading from "@/app/loading";
import PaymentList from "@/components/payments/PaymentList";
import { getPayments } from "@/lib/api/payments/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function PaymentsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Payments</h1>
        </div>
        <Payments />
      </div>
    </main>
  );
}

const Payments = async () => {
  await checkAuth();

  const { payments } = await getPayments();
  
  return (
    <Suspense fallback={<Loading />}>
      <PaymentList payments={payments}  />
    </Suspense>
  );
};

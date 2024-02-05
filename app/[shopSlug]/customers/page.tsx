import { Suspense } from "react";

import Loading from "@/app/loading";
import CustomerList from "@/components/customers/CustomerList";
import { getCustomers } from "@/lib/api/customers/queries";

import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function CustomersPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Customers</h1>
        </div>
        <Customers />
      </div>
    </main>
  );
}

const Customers = async () => {
  await checkAuth();

  const { customers } = await getCustomers();

  return (
    <Suspense fallback={<Loading />}>
      <CustomerList customers={customers} />
    </Suspense>
  );
};

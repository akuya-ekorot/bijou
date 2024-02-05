import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getCustomerById } from "@/lib/api/customers/queries";
import OptimisticCustomer from "./OptimisticCustomer";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";

export const revalidate = 0;

export default async function CustomerPage({
  params,
}: {
  params: { customerId: string };
}) {
  return (
    <main className="overflow-auto">
      <Customer id={params.customerId} />
    </main>
  );
}

const Customer = async ({ id }: { id: string }) => {
  await checkAuth();

  const { customer } = await getCustomerById(id);

  if (!customer) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/customers">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticCustomer customer={customer} />
      </div>
    </Suspense>
  );
};

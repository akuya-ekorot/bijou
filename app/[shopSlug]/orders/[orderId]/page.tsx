import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getOrderById } from '@/lib/api/orders/queries';
import { getCustomers } from '@/lib/api/customers/queries';
import { getPayments } from '@/lib/api/payments/queries';
import OptimisticOrder from './OptimisticOrder';
import { checkAuth } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function OrderPage({
  params,
}: {
  params: { orderId: string };
}) {
  return (
    <main className="overflow-auto">
      <Order id={params.orderId} />
    </main>
  );
}

const Order = async ({ id }: { id: string }) => {
  await checkAuth();

  const { order } = await getOrderById(id);
  const { customers } = await getCustomers();
  const { payments } = await getPayments();

  if (!order) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/orders">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticOrder
          order={order.order}
          customers={customers}
          payments={payments}
        />
      </div>
    </Suspense>
  );
};

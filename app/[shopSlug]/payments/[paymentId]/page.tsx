import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getPaymentById } from '@/lib/api/payments/queries';
import OptimisticPayment from './OptimisticPayment';
import { checkAuth } from '@/lib/auth/utils';

import { Button } from '@/components/ui/button';
import { ChevronLeftIcon } from 'lucide-react';
import Loading from '@/app/loading';

export const revalidate = 0;

export default async function PaymentPage({
  params,
}: {
  params: { paymentId: string };
}) {
  return (
    <main className="overflow-auto">
      <Payment id={params.paymentId} />
    </main>
  );
}

const Payment = async ({ id }: { id: string }) => {
  await checkAuth();

  const { payment } = await getPaymentById(id);

  if (!payment) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/payments">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticPayment payment={payment} />
      </div>
    </Suspense>
  );
};

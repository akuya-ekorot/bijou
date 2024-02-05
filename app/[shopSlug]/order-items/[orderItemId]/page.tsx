import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getOrderItemById } from "@/lib/api/orderItems/queries";
import { getOrders } from "@/lib/api/orders/queries";
import { getProducts } from "@/lib/api/products/queries";
import { getShops } from "@/lib/api/shops/queries";
import OptimisticOrderItem from "./OptimisticOrderItem";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";

export const revalidate = 0;

export default async function OrderItemPage({
  params,
}: {
  params: { orderItemId: string };
}) {
  return (
    <main className="overflow-auto">
      <OrderItem id={params.orderItemId} />
    </main>
  );
}

const OrderItem = async ({ id }: { id: string }) => {
  await checkAuth();

  const { orderItem } = await getOrderItemById(id);
  const { orders } = await getOrders();
  const { products } = await getProducts();
  const { shops } = await getShops();

  if (!orderItem) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/order-items">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticOrderItem
          orderItem={orderItem.orderItem}
          orders={orders.map((order) => order.order)}
          products={products}
          shops={shops}
        />
      </div>
    </Suspense>
  );
};

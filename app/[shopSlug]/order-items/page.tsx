import { Suspense } from 'react';

import Loading from '@/app/loading';
import OrderItemList from '@/components/orderItems/OrderItemList';
import { getOrderItems } from '@/lib/api/orderItems/queries';
import { getOrders } from '@/lib/api/orders/queries';
import { getProducts } from '@/lib/api/products/queries';
import { getShops } from '@/lib/api/shops/queries';
import { checkAuth } from '@/lib/auth/utils';

export const revalidate = 0;

export default async function OrderItemsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Order Items</h1>
        </div>
        <OrderItems />
      </div>
    </main>
  );
}

const OrderItems = async () => {
  await checkAuth();

  const { orderItems } = await getOrderItems();
  const { orders } = await getOrders();
  const { products } = await getProducts();
  const { shops } = await getShops();
  return (
    <Suspense fallback={<Loading />}>
      <OrderItemList
        orderItems={orderItems}
        orders={orders.map((order) => order.order)}
        products={products}
        shops={shops}
      />
    </Suspense>
  );
};

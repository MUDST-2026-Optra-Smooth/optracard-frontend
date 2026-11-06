import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { OrderSummary } from '../components/OrderSummary';
import { loadSellerOrder } from '../api/seller';
import type { SellerOrder } from '../types/seller';

const formatPlacedAt = (value: string | null) => {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
};

/** Order summary for a store owner, with Print / Save as PDF for packing and records. */
export const SellerOrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);
  const [order, setOrder] = useState<SellerOrder | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError('Invalid order ID.');
      return;
    }
    let isCurrent = true;
    setError(null);
    loadSellerOrder(id)
      .then((loaded) => { if (isCurrent) setOrder(loaded); })
      .catch((requestError) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : 'Could not load this order.');
      });
    return () => { isCurrent = false; };
  }, [id]);

  const isPickup = order?.shippingMethod?.toLowerCase() === 'pickup';
  const deliveryLines = order
    ? [order.recipientName, order.shippingAddress, order.recipientPhone].filter((line): line is string => Boolean(line?.trim()))
    : [];
  const address = deliveryLines.length ? deliveryLines : [isPickup ? 'Store pickup' : 'Delivery address not available'];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="orders" />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-5">
            <button
              type="button"
              onClick={() => navigate('/orders-management')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </button>

            {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {!error && !order && <p className="py-16 text-center text-sm text-slate-500">Loading order…</p>}

            {order && (
              <>
                <OrderSummary
                  order={{
                    orderNumber: order.orderNumber,
                    placedAt: formatPlacedAt(order.createdAt),
                    storeName: order.storeName ?? order.items[0]?.storeName ?? 'My shop',
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    items: order.items.map((item) => ({ key: `${item.productId}-${item.name}`, name: item.name, game: item.game, price: item.price, quantity: item.quantity })),
                    subtotal: order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    discountCode: order.discountCode,
                    discountName: order.discountName,
                    discountAmount: order.discountAmount ?? 0,
                    shippingFee: order.shippingFee ?? 0,
                    total: order.total,
                    address,
                  }}
                />

                <section className="print:hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900">Customer and delivery</h2>
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-slate-400">Delivery method</dt><dd className="font-semibold">{isPickup ? 'Store pickup' : order.shippingMethod ?? 'Not specified'}</dd></div>
                    <div><dt className="text-slate-400">Tracking number</dt><dd className="font-semibold">{order.trackingNumber ?? '—'}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-slate-400">Recipient and address</dt><dd className="font-semibold">{address.map((line, index) => <p key={`${line}-${index}`} className="whitespace-pre-wrap">{line}</p>)}</dd></div>
                  </dl>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerOrderDetail;

import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Printer, RefreshCcw, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdminOrder, updateAdminOrderStatus } from '../api/admin';
import {
  AdminError,
  AdminLoading,
  AdminWorkspace,
  formatCurrency,
  formatDate,
  StatusBadge,
} from '../components/AdminWorkspace';
import type { AdminOrder } from '../types/admin';

export const ADorderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(null);
    try {
      setOrder(await loadAdminOrder(id));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load order.');
    }
  };

  useEffect(() => {
    if (Number.isInteger(id) && id > 0) {
      void load();
    } else {
      setError('Invalid order ID.');
    }
  }, [id]);

  const changeStatus = async (status: string) => {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateAdminOrderStatus(order.id, status);
      setOrder(updated);
      setSuccessMessage(`Order status successfully updated to “${updated.status}” in the database.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update order status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminWorkspace currentTab="orders">
      <button
        type="button"
        onClick={() => navigate('/admin/orders')}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      {error && (
        <div className="mb-5">
          <AdminError message={error} onRetry={() => void load()} />
        </div>
      )}

      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {!error && !order && <AdminLoading label="Loading order details from database…" />}

      {order && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Admin order view</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-slate-500">Placed {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void load()}
                title="Refresh order"
                className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm hover:bg-slate-50 cursor-pointer"
              >
                <RefreshCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <section className="space-y-5 lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b p-5">
                  <h2 className="font-bold text-slate-900">Order items</h2>
                </div>
                {order.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.name}`}
                    className="flex items-center gap-4 border-b border-slate-100 p-5 last:border-0"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-16 w-14 rounded bg-slate-100 object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-16 w-14 rounded bg-slate-100 ring-1 ring-slate-200" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">
                        {item.game} · Product ID {item.productId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length === 0 && (
                  <p className="p-6 text-center text-sm text-slate-500">No line items found.</p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900">Customer & delivery</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-400">Customer</dt>
                      <dd className="font-semibold text-slate-900">{order.buyerName}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Recipient</dt>
                      <dd className="font-semibold text-slate-900">{order.recipientName ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Phone</dt>
                      <dd className="font-semibold text-slate-900">{order.recipientPhone ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Address</dt>
                      <dd className="whitespace-pre-wrap font-semibold text-slate-900">
                        {order.shippingAddress ?? '—'}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-bold text-slate-900">Payment & fulfilment</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="text-slate-400">Store</dt>
                      <dd className="font-semibold text-slate-900">
                        {order.storeName ?? 'Optracard Official Store'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Source</dt>
                      <dd className="font-semibold text-slate-900">{order.source}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Payment</dt>
                      <dd className="mt-1">
                        <StatusBadge status={order.paymentStatus} />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Shipping method</dt>
                      <dd className="font-semibold text-slate-900">{order.shippingMethod ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Tracking number</dt>
                      <dd className="font-semibold text-slate-900">{order.trackingNumber ?? '—'}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">Order control</h2>
              <div className="mt-4">
                <p className="text-sm text-slate-500">Current status</p>
                <div className="mt-2">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <label className="mt-5 block text-sm font-semibold text-slate-700">
                Update status in database
                <select
                  disabled={saving}
                  value={order.status.toUpperCase()}
                  onChange={(event) => void changeStatus(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELED">Canceled</option>
                </select>
              </label>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-500">Order total</p>
                <p className="mt-1 text-3xl font-bold text-blue-600">{formatCurrency(order.total)}</p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default ADorderDetail;

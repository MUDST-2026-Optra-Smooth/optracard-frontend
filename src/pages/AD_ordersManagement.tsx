import { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadAdminOrders, type AdminOrderSource } from '../api/admin';
import {
  AdminError,
  AdminLoading,
  AdminWorkspace,
  formatCurrency,
  formatDate,
  StatusBadge,
} from '../components/AdminWorkspace';
import type { AdminOrder } from '../types/admin';

export const ADordersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [source, setSource] = useState<AdminOrderSource>('OFFICIAL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await loadAdminOrders(source));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }, [source]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return orders.filter(
      (order) =>
        (status === 'ALL' || order.status.toUpperCase() === status) &&
        (!text ||
          `${order.orderNumber} ${order.buyerName} ${order.storeName ?? ''} ${order.id}`
            .toLowerCase()
            .includes(text)),
    );
  }, [orders, query, status]);

  return (
    <AdminWorkspace currentTab="orders">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orders Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review Official Store fulfillment and monitor Marketplace orders without changing seller fulfillment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5">
          <AdminError message={error} onRetry={() => void load()} />
        </div>
      )}

      <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Order source">
          {([
            ['OFFICIAL', 'Official Store'],
            ['MARKETPLACE', 'Marketplace'],
            ['ALL', 'All orders'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setSource(value)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition cursor-pointer ${source === value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, customer, or seller store"
            className="w-full rounded-lg bg-slate-100 py-2.5 pl-10 pr-3 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg bg-slate-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 md:w-48"
        >
          <option value="ALL">All statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELED">Canceled</option>
        </select>
        </div>
      </div>

      {loading ? (
        <AdminLoading label="Loading orders from database…" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Order</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Store</th>
                <th className="px-5 py-4">Created</th>
                <th className="px-5 py-4 text-right">Total</th>
                <th className="px-5 py-4">Payment</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-blue-600">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="hover:underline cursor-pointer"
                    >
                      {order.orderNumber}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{order.buyerName}</p>
                    <p className="text-xs text-slate-500">Buyer ID: {order.buyerId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-slate-700">{order.storeName ?? 'Optracard Official Store'}</p>
                    <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${order.source === 'MARKETPLACE'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-blue-100 text-blue-700'}`}
                    >
                      {order.source === 'MARKETPLACE' ? 'Marketplace' : 'Official Store'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDate(order.createdAt)}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900">{formatCurrency(order.total)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.paymentStatus} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      title="View order details"
                      className="rounded p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminWorkspace>
  );
};

export default ADordersManagement;

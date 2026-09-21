import { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  RefreshCcw,
  Search,
  Truck,
  Store,
  Eye,
  X,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { loadMyStore, loadSellerOrders, updateSellerOrderStatus } from '../api/seller';
import type { SellerOrder, SellerStoreInfo } from '../types/seller';
import { formatPrice } from '../context/formatters';

const STATUS_OPTIONS = ['Processing', 'Shipped', 'Delivered', 'Canceled'] as const;
type OrderStatusType = (typeof STATUS_OPTIONS)[number];

const statusColors: Record<string, string> = {
  Processing: 'bg-blue-50 text-blue-700 border-blue-200',
  Shipped: 'bg-amber-50 text-amber-700 border-amber-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Canceled: 'bg-red-50 text-red-700 border-red-200',
};

export const OrdersManagement = () => {
  const [store, setStore] = useState<SellerStoreInfo | null>(null);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeModalOrder, setActiveModalOrder] = useState<SellerOrder | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedStore, loadedOrders] = await Promise.all([
        loadMyStore().catch(() => null),
        loadSellerOrders(),
      ]);
      setStore(loadedStore);
      setOrders(loadedOrders);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateStatus = async (order: SellerOrder, newStatus: string) => {
    setUpdatingId(order.orderId);
    setError(null);
    try {
      const updated = await updateSellerOrderStatus(order.orderId, newStatus);
      setOrders((current) => current.map((item) => (item.orderId === updated.orderId ? updated : item)));
      if (activeModalOrder?.orderId === updated.orderId) {
        setActiveModalOrder(updated);
      }
      setActionNotice(`Order ${updated.orderNumber} status updated to ${newStatus}.`);
      setTimeout(() => setActionNotice(null), 3500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: orders.length,
      Processing: orders.filter((o) => o.status === 'Processing').length,
      Shipped: orders.filter((o) => o.status === 'Shipped').length,
      Delivered: orders.filter((o) => o.status === 'Delivered').length,
      Canceled: orders.filter((o) => o.status === 'Canceled').length,
    }),
    [orders],
  );

  const tabs = [
    { label: 'All', count: counts.all },
    { label: 'Processing', count: counts.Processing },
    { label: 'Shipped', count: counts.Shipped },
    { label: 'Delivered', count: counts.Delivered },
    { label: 'Canceled', count: counts.Canceled },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = selectedTab === 'All' || order.status === selectedTab;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        (order.recipientName && order.recipientName.toLowerCase().includes(query)) ||
        (order.recipientPhone && order.recipientPhone.includes(query)) ||
        order.items.some((item) => item.name.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [orders, selectedTab, search]);

  const storeName = store?.storeName || 'My Shop';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar currentTab="orders" />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Spacer for Fixed AdminHeader */}
        <div className="h-16 bg-[#08152a]" aria-hidden="true" />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px] space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">My Shop</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{storeName}</span>
                </div>
                <h1 className="mt-1 text-3xl font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardList className="h-7 w-7 text-blue-600" />
                  Orders Management
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Track and fulfill customer orders containing items from {storeName}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition cursor-pointer shrink-0"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Orders
              </button>
            </div>

            {/* Action Notice Banner */}
            {actionNotice && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{actionNotice}</span>
              </div>
            )}

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Filter Tabs & Search Controls */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
                  {tabs.map((tab) => {
                    const isSelected = selectedTab === tab.label;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => setSelectedTab(tab.label)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-white text-blue-600 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Order # or Buyer…"
                    className="w-full rounded-lg bg-slate-100 py-2 pl-9 pr-3 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Order Number</th>
                    <th className="px-5 py-4">Customer Details</th>
                    <th className="px-5 py-4">Items Summary</th>
                    <th className="px-5 py-4">Total & Payment</th>
                    <th className="px-5 py-4">Date Placed</th>
                    <th className="px-5 py-4">Fulfillment Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                        Loading your customer orders from database…
                      </td>
                    </tr>
                  )}

                  {!isLoading &&
                    filteredOrders.map((order) => {
                      const isPickup = order.shippingMethod === 'pickup';
                      const badgeClass = statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200';
                      return (
                        <tr key={order.orderId} className="hover:bg-slate-50/70 transition">
                          {/* Order Number */}
                          <td className="px-5 py-4 font-bold text-blue-600">
                            <span className="cursor-pointer hover:underline" onClick={() => setActiveModalOrder(order)}>
                              {order.orderNumber}
                            </span>
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {order.recipientName || `Buyer #${order.buyerId}`}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500">
                              {isPickup ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                  <Store className="h-3 w-3" /> Store Pickup
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-500 truncate max-w-xs">
                                  <Truck className="h-3 w-3 text-blue-500 shrink-0" />
                                  {order.shippingAddress || 'Standard delivery'}
                                </span>
                              )}
                            </div>
                            {order.recipientPhone && (
                              <p className="text-[11px] text-slate-400 mt-0.5">📞 {order.recipientPhone}</p>
                            )}
                          </td>

                          {/* Items Summary */}
                          <td className="px-5 py-4">
                            <div className="space-y-1 max-w-xs">
                              {order.items.slice(0, 2).map((item) => (
                                <div key={item.productId} className="flex items-center gap-2 text-xs truncate">
                                  <div className="h-6 w-6 rounded bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                    {item.imageUrl ? (
                                      <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="text-[10px]">🃏</span>
                                    )}
                                  </div>
                                  <span className="font-medium text-slate-800 truncate">{item.name}</span>
                                  <span className="text-slate-400 font-bold shrink-0">×{item.quantity}</span>
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-[10px] text-blue-600 font-semibold cursor-pointer" onClick={() => setActiveModalOrder(order)}>
                                  +{order.items.length - 2} more item(s)…
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-900">{formatPrice(order.total)}</p>
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {order.paymentStatus || 'PAID'}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>

                          {/* Status changer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <select
                                value={order.status}
                                disabled={updatingId === order.orderId}
                                onChange={(e) => void updateStatus(order, e.target.value)}
                                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition outline-none cursor-pointer ${badgeClass}`}
                              >
                                {STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} className="text-slate-800 bg-white font-medium">
                                    {opt}
                                  </option>
                                ))}
                              </select>
                              {updatingId === order.orderId && (
                                <span className="text-[10px] text-slate-400 animate-pulse">Saving…</span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setActiveModalOrder(order)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-xs font-semibold text-slate-700 hover:text-blue-600 transition cursor-pointer"
                              title="View full order details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                  {!isLoading && filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                        <ClipboardList className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700">No orders found in this category</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedTab !== 'All'
                            ? `There are currently no orders marked as "${selectedTab}".`
                            : 'When customers order your products, their orders will appear here.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Order Detail Modal */}
      {activeModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          onClick={() => setActiveModalOrder(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Order Details — {activeModalOrder.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Placed on{' '}
                    {activeModalOrder.createdAt
                      ? new Date(activeModalOrder.createdAt).toLocaleString()
                      : 'Unknown date'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Status Update Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Fulfillment Status</p>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      statusColors[activeModalOrder.status] || ''
                    }`}
                  >
                    {activeModalOrder.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Change to:</span>
                  <select
                    value={activeModalOrder.status}
                    onChange={(e) => void updateStatus(activeModalOrder, e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-blue-500" /> Customer Information
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {activeModalOrder.recipientName || `Buyer #${activeModalOrder.buyerId}`}
                  </p>
                  <p className="text-xs text-slate-600">
                    Phone: {activeModalOrder.recipientPhone || 'Not provided'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Delivery Address
                  </p>
                  <p className="text-xs font-semibold text-slate-700">
                    Method:{' '}
                    {activeModalOrder.shippingMethod === 'pickup' ? 'Store Counter Pickup' : 'Standard Delivery'}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeModalOrder.shippingAddress || 'No address required (Store Pickup)'}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Ordered Items ({activeModalOrder.items.length})
                </h4>
                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                  {activeModalOrder.items.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-3.5 bg-white">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-10 rounded-md bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs">🃏</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.game}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-slate-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Payment Status:</span>
                  <span className="font-bold text-emerald-600">{activeModalOrder.paymentStatus || 'PAID'}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-blue-600">{formatPrice(activeModalOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;

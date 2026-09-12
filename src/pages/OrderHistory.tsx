import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { OrderHistoryCard, type OrderItem, type OrderStatus } from '../components/OrderHistoryCard';
import { OrderHistoryStat } from '../components/OrderHistoryStat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
type Order = { orderNumber: string; placedAt: string; store: string; status: OrderStatus; items: OrderItem[]; total: number; statusNote: string; actions: Array<{ label: string; variant: 'link' | 'outline' | 'primary'; to?: string }> };
const sortOptions: DropdownOption[] = [{ label: 'Newest first', value: 'newest', shortLabel: 'Newest first' }, { label: 'Oldest first', value: 'oldest', shortLabel: 'Oldest first' }, { label: 'Total: High to Low', value: 'total-high', shortLabel: 'Total: High to Low' }, { label: 'Total: Low to High', value: 'total-low', shortLabel: 'Total: Low to High' }];
const statuses: OrderStatus[] = ['Processing', 'Shipped', 'Delivered', 'Canceled'];

const mapOrder = (raw: any): Order => {
  const items: OrderItem[] = (raw.items ?? []).map((item: any, index: number) => ({ id: String(item.productId ?? index), name: item.name, detail: `${item.game} · ${item.storeName ?? raw.store ?? 'Optracard'}`, price: Number(item.price ?? 0), quantity: Number(item.quantity ?? 0), imageTone: index % 2 ? 'blue' : 'orange', imageUrl: item.imageUrl ?? undefined }));
  const status = statuses.includes(raw.status) ? raw.status : 'Processing';
  const placedAt = raw.createdAt ? new Date(raw.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently';
  const store = raw.storeName || items[0]?.detail?.split(' · ')[1] || 'Optracard Official Store';
  const sellerNote = raw.source === 'MARKETPLACE' ? 'Marketplace seller' : 'Official Store';
  const deliveryNote = raw.shippingMethod === 'standard' ? 'Standard delivery' : 'Store pickup';
  return { orderNumber: raw.orderNumber ?? `ORD-${raw.orderId}`, placedAt, store, status, items, total: Number(raw.total ?? 0), statusNote: `${sellerNote} · ${deliveryNote}`, actions: [{ label: 'View order detail', variant: 'primary', to: `/order-history/${raw.orderNumber ?? raw.orderId}` }] };
};

export function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState('All orders');
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(typeof location.state?.message === 'string' ? location.state.message : null);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }
      try { const response = await fetch(`${API_BASE_URL}/api/orders`, { headers: { Authorization: `Bearer ${token}` } }); const data = await response.json().catch(() => []); if (!response.ok) throw new Error(data?.message || 'Could not load order history.'); setOrders(data.map(mapOrder)); }
      catch (e) { setError(e instanceof Error ? e.message : 'Could not load order history.'); }
      finally { setIsLoading(false); }
    };
    void load(); window.scrollTo({ top: 0, behavior: 'auto' });
  }, [navigate]);

  const counts = useMemo(() => ({ all: orders.length, processing: orders.filter((o) => o.status === 'Processing').length, shipped: orders.filter((o) => o.status === 'Shipped').length, delivered: orders.filter((o) => o.status === 'Delivered').length, canceled: orders.filter((o) => o.status === 'Canceled').length }), [orders]);
  const visibleOrders = useMemo(() => { const status = selectedTab === 'All orders' ? null : selectedTab as OrderStatus; const filtered = status ? orders.filter((o) => o.status === status) : [...orders]; if (selectedSort.value === 'oldest') return filtered.reverse(); if (selectedSort.value === 'total-high') return filtered.sort((a, b) => b.total - a.total); if (selectedSort.value === 'total-low') return filtered.sort((a, b) => a.total - b.total); return filtered; }, [orders, selectedSort.value, selectedTab]);
  const tabs = [{ label: 'All orders', count: counts.all }, { label: 'Processing', count: counts.processing }, { label: 'Shipped', count: counts.shipped }, { label: 'Delivered', count: counts.delivered }, { label: 'Canceled', count: counts.canceled }];
  const delivered = counts.delivered;
  const open = orders.filter((o) => o.status === 'Processing' || o.status === 'Shipped').length;
  return <section className="min-h-full bg-[#f6f8fb] font-sans text-[#20242b]"><div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><button className="mb-4 flex items-center gap-1 text-xs font-bold text-[#2f65ff]" onClick={() => navigate('/')} type="button">← Continue Shopping</button><nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#a1a8b3]"><Link to="/">Home</Link><span>/</span><span className="text-[#59616d]">Order History</span></nav><h1 className="text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">Order History</h1><p className="mt-1 text-xs text-[#9198a3]">View your previous orders and track delivery status.</p>{message && <p role="status" className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}{error && <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><OrderHistoryStat label="Total orders" value={String(counts.all)} detail="From database" /><OrderHistoryStat label="Open orders" value={String(open)} detail="Track now" detailTone="blue" /><OrderHistoryStat label="Delivered" value={String(delivered)} detail={counts.all ? `${Math.round((delivered / counts.all) * 100)}% completed` : '0% completed'} /></div>
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e6e9ef] bg-white px-2 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-3"><div className="flex flex-wrap items-center gap-1">{tabs.map((tab) => <button key={tab.label} type="button" onClick={() => setSelectedTab(tab.label)} className={`rounded-md px-3 py-2 text-[10px] font-bold ${selectedTab === tab.label ? 'bg-[#edf4ff] text-[#2f65ff]' : 'text-[#8e97a3] hover:bg-[#f7f9fc]'}`}>{tab.label} ({tab.count})</button>)}</div><FilterDropdown label="Sort:" options={sortOptions} selected={selectedSort} onSelect={setSelectedSort} align="right" /></div>
    {isLoading ? <p className="py-16 text-center text-base text-slate-500">Loading order history…</p> : <div className="mt-4 space-y-3">{visibleOrders.length > 0 ? visibleOrders.map((order) => <OrderHistoryCard key={order.orderNumber} {...order} />) : <div className="rounded-xl border border-dashed border-[#dfe4eb] bg-white px-6 py-12 text-center"><p className="text-sm font-bold text-[#59616d]">No orders in this category yet.</p><p className="mt-1 text-xs text-[#a1a8b3]">Your next purchase will appear here.</p></div>}</div>}
  </div></section>;
}

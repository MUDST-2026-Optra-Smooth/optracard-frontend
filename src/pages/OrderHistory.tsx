import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { OrderHistoryCard, type OrderItem, type OrderStatus } from '../components/OrderHistoryCard';
import { OrderHistoryStat } from '../components/OrderHistoryStat';

type Order = {
  orderNumber: string;
  placedAt: string;
  store: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  statusNote: string;
  actions: Array<{
    label: string;
    variant: 'link' | 'outline' | 'primary';
    to?: string;
  }>;
};

const orders: Order[] = [
  {
    orderNumber: 'ORD-20250819-0842',
    placedAt: '19 Aug 2025',
    store: 'Pokemon Center TH',
    status: 'Shipped',
    items: [
      {
        id: 'charizard',
        name: 'Charizard ex · 223/197',
        detail: 'Pokémon · Scarlet & Violet · Near mint',
        price: 2800,
        quantity: 1,
        imageTone: 'orange',
      },
      {
        id: 'one-piece-op13',
        name: 'Bandai One Piece OP-13 jp',
        detail: 'One Piece · Booster Pack · Light play',
        price: 980,
        quantity: 1,
        imageTone: 'red',
      },
    ],
    total: 6980,
    statusNote: 'Standard shipping · Free',
    actions: [
      { label: 'Contact store', variant: 'link' },
      { label: 'Track delivery', variant: 'outline' },
      { label: 'View order detail', variant: 'primary', to: '/order-history/ORD-20250819-0842' },
    ],
  },
  {
    orderNumber: 'ORD-20250814-0768',
    placedAt: '14 Aug 2025',
    store: 'Card Realm',
    status: 'Delivered',
    items: [
      {
        id: 'blue-eyes',
        name: 'Blue-Eyes White Dragon',
        detail: 'Yu-Gi-Oh! · Quarter Century · Near mint',
        price: 1450,
        quantity: 1,
        imageTone: 'blue',
      },
      {
        id: 'luffy-sec',
        name: 'Monkey D. Luffy · SEC',
        detail: 'One Piece · Romance Dawn · Near mint',
        price: 1970,
        quantity: 1,
        imageTone: 'purple',
      },
    ],
    total: 3420,
    statusNote: 'Delivered on 17 Aug 2025',
    actions: [
      { label: 'Buy again', variant: 'link' },
      { label: 'View order detail', variant: 'outline', to: '/order-history/ORD-20250814-0768' },
    ],
  },
  {
    orderNumber: 'ORD-20250805-0623',
    placedAt: '05 Aug 2025',
    store: 'Meta TCG',
    status: 'Processing',
    items: [
      {
        id: 'gol-d-roger',
        name: 'Gol D. Roger · Manga Rare',
        detail: 'One Piece · OP-09 · Near mint',
        price: 4800,
        quantity: 1,
        imageTone: 'green',
      },
    ],
    total: 4800,
    statusNote: 'Preparing your order',
    actions: [
      { label: 'Contact store', variant: 'link' },
      { label: 'View order detail', variant: 'primary', to: '/order-history/ORD-20250805-0623' },
    ],
  },
];

const tabs: Array<{ label: string; count: number; status?: OrderStatus }> = [
  { label: 'All orders', count: 24 },
  { label: 'Processing', count: 1, status: 'Processing' },
  { label: 'Shipped', count: 23, status: 'Shipped' },
  { label: 'Delivered', count: 19, status: 'Delivered' },
  { label: 'Canceled', count: 2, status: 'Canceled' },
];

const sortOptions: DropdownOption[] = [
  { label: 'Newest first', value: 'newest', shortLabel: 'Newest first' },
  { label: 'Oldest first', value: 'oldest', shortLabel: 'Oldest first' },
  { label: 'Total: High to Low', value: 'total-high', shortLabel: 'Total: High to Low' },
  { label: 'Total: Low to High', value: 'total-low', shortLabel: 'Total: Low to High' },
];

export function OrderHistory() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(tabs[0].label);
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleOrders = useMemo(() => {
    const activeTab = tabs.find((tab) => tab.label === selectedTab);
    const filtered = activeTab?.status
      ? orders.filter((order) => order.status === activeTab.status)
      : [...orders];

    if (selectedSort.value === 'oldest') return filtered.reverse();
    if (selectedSort.value === 'total-high') return filtered.sort((a, b) => b.total - a.total);
    if (selectedSort.value === 'total-low') return filtered.sort((a, b) => a.total - b.total);
    return filtered;
  }, [selectedSort, selectedTab]);

  return (
    <section className="min-h-full bg-[#f6f8fb] font-sans text-[#20242b]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div>
          <div>
            <button
              className="mb-4 flex items-center gap-1 text-xs font-bold text-[#2f65ff] transition hover:text-[#1647c4]"
              onClick={() => navigate('/')}
              type="button"
            >
              ← Continue Shopping
            </button>
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#a1a8b3]">
              <Link className="transition hover:text-[#2f65ff]" to="/">Home</Link>
              <span>/</span>
              <span className="text-[#59616d]">Order History</span>
            </nav>
            <h1 className="text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">Order History</h1>
            <p className="mt-1 text-xs text-[#9198a3]">View your previous orders and track delivery status.</p>
          </div>

        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <OrderHistoryStat label="Total orders" value="24" detail="+3 this year" />
          <OrderHistoryStat label="Open orders" value="2" detail="Track now" detailTone="blue" />
          <OrderHistoryStat label="Delivered" value="19" detail="82% completed" />
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e6e9ef] bg-white px-2 py-2 shadow-[0_2px_8px_rgba(27,39,63,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-3">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => {
              const isSelected = selectedTab === tab.label;
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setSelectedTab(tab.label)}
                  className={`rounded-md px-3 py-2 text-[10px] font-bold transition ${
                    isSelected ? 'bg-[#edf4ff] text-[#2f65ff]' : 'text-[#8e97a3] hover:bg-[#f7f9fc] hover:text-[#59616d]'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>
          <FilterDropdown
            label="Sort:"
            options={sortOptions}
            selected={selectedSort}
            onSelect={setSelectedSort}
            align="right"
          />
        </div>

        <div className="mt-4 space-y-3">
          {visibleOrders.length > 0 ? (
            visibleOrders.map((order) => <OrderHistoryCard key={order.orderNumber} {...order} />)
          ) : (
            <div className="rounded-xl border border-dashed border-[#dfe4eb] bg-white px-6 py-12 text-center">
              <p className="text-sm font-bold text-[#59616d]">No orders in this category yet.</p>
              <p className="mt-1 text-xs text-[#a1a8b3]">Your next purchase will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

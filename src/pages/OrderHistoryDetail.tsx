import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { OrderDetailPanel } from '../components/OrderDetailPanel';
import { type OrderItem, type OrderStatus } from '../components/OrderHistoryCard';
import { formatPrice } from '../context/formatters';

type TimelineState = 'completed' | 'current' | 'upcoming';

type TimelineStep = {
  label: string;
  description: string;
  timestamp: string;
  state: TimelineState;
};

type OrderDetail = {
  orderNumber: string;
  placedAt: string;
  store: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  address: string[];
  trackingNumber: string;
  trackingStatus: string;
  carrier: string;
  deliveryMethod: string;
  timeline: TimelineStep[];
};

const orderDetails: Record<string, OrderDetail> = {
  'ORD-20250819-0842': {
    orderNumber: 'ORD-20250819-0842',
    placedAt: '19 Aug 2025, 14:12',
    store: 'Pokemon Center TH',
    status: 'Shipped',
    items: [
      {
        id: 'charizard-detail',
        name: 'Charizard ex · 223/197',
        detail: 'Pokémon · Scarlet & Violet · Near mint · Sleeved',
        price: 2800,
        quantity: 1,
        imageTone: 'orange',
      },
      {
        id: 'pikachu-detail',
        name: 'Pikachu VMAX · Rainbow',
        detail: 'Pokémon · Vivid Voltage · Near mint · Sleeved',
        price: 980,
        quantity: 1,
        imageTone: 'green',
      },
      {
        id: 'blue-eyes-detail',
        name: 'Blue-Eyes White Dragon',
        detail: 'Yu-Gi-Oh! · Quarter Century · Near mint',
        price: 3200,
        quantity: 1,
        imageTone: 'blue',
      },
    ],
    subtotal: 6980,
    shippingFee: 0,
    total: 6980,
    address: [
      'Alex Morgan',
      '23/45 Sukhumvit Road',
      'Khlong Toei, Bangkok 10110',
      'Thailand',
      '+66 89 123 4567',
    ],
    trackingNumber: 'TH1234567890',
    trackingStatus: 'In transit',
    carrier: 'Kerry Express',
    deliveryMethod: 'Standard delivery',
    timeline: [
      {
        label: 'Order placed',
        description: 'We received your order and sent it to the store.',
        timestamp: '19 Aug · 14:12',
        state: 'completed',
      },
      {
        label: 'Packed by store',
        description: 'The store prepared your order for shipment.',
        timestamp: '20 Aug · 09:31',
        state: 'completed',
      },
      {
        label: 'Shipped',
        description: 'Package picked up by Kerry Express.',
        timestamp: '20 Aug · 12:41',
        state: 'current',
      },
      {
        label: 'Out for delivery',
        description: 'The package will be at your door soon.',
        timestamp: 'Estimated 21 Aug · 21:34',
        state: 'upcoming',
      },
      {
        label: 'Delivered',
        description: 'Awaiting delivery confirmation.',
        timestamp: '—',
        state: 'upcoming',
      },
    ],
  },
};

const fallbackOrder = orderDetails['ORD-20250819-0842'];

const statusStyles: Record<OrderStatus, string> = {
  Processing: 'bg-[#fff5dc] text-[#b47a00]',
  Shipped: 'bg-[#edf4ff] text-[#2f65ff]',
  Delivered: 'bg-[#eafaf3] text-[#159568]',
  Canceled: 'bg-[#fff0f0] text-[#dc4c4c]',
};

const timelineDotStyles: Record<TimelineState, string> = {
  completed: 'border-[#18a36b] bg-[#18a36b]',
  current: 'border-[#2f65ff] bg-[#2f65ff]',
  upcoming: 'border-[#d8dee7] bg-white',
};

export function OrderHistoryDetail() {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const selectedOrder = orderDetails[orderNumber ?? ''] ?? fallbackOrder;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [orderNumber]);

  return (
    <section className="min-h-full bg-[#f6f8fb] font-sans text-[#20242b]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate('/order-history')}
              className="mb-4 flex items-center gap-1 text-[10px] font-bold text-[#2f65ff] transition hover:text-[#1647c4]"
            >
              ← Back to order history
            </button>
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#a1a8b3]">
              <Link className="transition hover:text-[#2f65ff]" to="/">Home</Link>
              <span>/</span>
              <Link className="transition hover:text-[#2f65ff]" to="/order-history">Order History</Link>
              <span>/</span>
              <span className="text-[#59616d]">Detail</span>
            </nav>
            <h1 className="text-2xl font-black tracking-tight text-[#171a20] sm:text-3xl">Order #{selectedOrder.orderNumber}</h1>
            <p className="mt-1 text-[10px] text-[#9198a3]">Placed on {selectedOrder.placedAt} · Sold by {selectedOrder.store}</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${statusStyles[selectedOrder.status]}`}>
              • {selectedOrder.status}
            </span>
            <button
              type="button"
              className="rounded-md border border-[#dfe4eb] bg-white px-3 py-2 text-[10px] font-bold text-[#657080] transition hover:border-[#2f65ff] hover:text-[#2f65ff]"
            >
              ↓ Download receipt
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
          <div className="space-y-3">
            <OrderDetailPanel
              title="Items in your order"
              subtitle={`${selectedOrder.items.length} products · Sold by ${selectedOrder.store}`}
              headerRight={<p className="text-[10px] text-[#a1a8b3]">Order total {formatPrice(selectedOrder.total)}</p>}
            >
              <div className="divide-y divide-[#f0f2f5]">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3 first:pt-0 last:pb-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-9 flex-shrink-0 items-center justify-center rounded-sm bg-gray-100">
                        <span className="text-[8px] font-bold text-gray-400">[Image]</span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-[#303844]">{item.name}</p>
                        <p className="mt-0.5 truncate text-[10px] text-[#a1a8b3]">{item.detail}</p>
                      </div>
                    </div>
                    <p className="whitespace-nowrap text-[10px] font-bold text-[#2d3440]">{formatPrice(item.price)}</p>
                    <p className="whitespace-nowrap text-[10px] text-[#929aa6]">Qty {item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#edf0f4] pt-3 text-[10px]">
                <div className="flex justify-between py-1 text-[#929aa6]">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1 text-[#929aa6]">
                  <span>Shipping fee</span>
                  <span className="font-bold text-[#18a36b]">{selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-[#edf0f4] pt-3 text-xs font-black text-[#2d3440]">
                  <span>Total</span>
                  <span className="text-[#2f65ff]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </OrderDetailPanel>

            <div className="flex items-start gap-2 rounded-xl border border-[#e4e8ee] bg-white px-4 py-3 text-[10px] text-[#89929e] shadow-[0_3px_12px_rgba(27,39,63,0.04)]">
              <span className="mt-0.5 text-[#2f65ff]">ⓘ</span>
              <p>Need help with this order? Contact the store first, or reach out to Optracard support if your order does not arrive by the estimated date.</p>
            </div>
          </div>

          <div className="space-y-3">
            <OrderDetailPanel title="Shipping address" subtitle="Delivery address" headerRight={<span className="text-[10px] text-[#a1a8b3]">⌖</span>}>
              <div className="space-y-0.5 text-[10px] leading-relaxed text-[#697381]">
                {selectedOrder.address.map((line) => (
                  <p key={line} className={line === selectedOrder.address[0] ? 'font-bold text-[#303844]' : ''}>{line}</p>
                ))}
              </div>
            </OrderDetailPanel>

            <OrderDetailPanel
              title="Tracking information"
              subtitle="Your parcel is on its way"
              headerRight={<span className="rounded-full bg-[#edf4ff] px-2 py-1 text-[9px] font-bold text-[#2f65ff]">• {selectedOrder.trackingStatus}</span>}
            >
              <p className="text-xs font-bold text-[#2f65ff]">{selectedOrder.trackingNumber}</p>
              <p className="mt-1 text-[10px] text-[#a1a8b3]">{selectedOrder.carrier} · {selectedOrder.deliveryMethod}</p>
              <button
                type="button"
                className="mt-3 w-full rounded-md bg-[#2f65ff] px-3 py-2 text-[10px] font-bold text-white shadow-[0_3px_8px_rgba(47,101,255,0.22)] transition hover:bg-[#1647c4]"
              >
                Track on carrier website ↗
              </button>
            </OrderDetailPanel>

            <OrderDetailPanel title="Order timeline" subtitle="Latest delivery updates">
              <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px before:bg-[#e5e9ef]">
                {selectedOrder.timeline.map((step) => (
                  <li key={step.label} className="relative grid grid-cols-[10px_minmax(0,1fr)_auto] items-start gap-3">
                    <span className={`z-10 mt-0.5 h-[9px] w-[9px] rounded-full border-2 ${timelineDotStyles[step.state]}`} />
                    <div className="min-w-0">
                      <p className={`text-[10px] font-bold ${step.state === 'upcoming' ? 'text-[#8e97a3]' : 'text-[#303844]'}`}>{step.label}</p>
                      <p className="mt-0.5 text-[9px] leading-relaxed text-[#a1a8b3]">{step.description}</p>
                    </div>
                    <p className="whitespace-nowrap text-right text-[9px] text-[#a1a8b3]">{step.timestamp}</p>
                  </li>
                ))}
              </ol>
            </OrderDetailPanel>
          </div>
        </div>
      </div>
    </section>
  );
}

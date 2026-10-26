import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { OrderDetailPanel } from '../components/OrderDetailPanel';
import { type OrderStatus } from '../components/OrderHistoryCard';
import { OrderSummary } from '../components/OrderSummary';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type TimelineState = 'completed' | 'current' | 'upcoming';

type TimelineStep = {
  label: string;
  description: string;
  timestamp: string;
  state: TimelineState;
};

type OrderLine = {
  productId: number;
  name: string;
  game: string;
  imageUrl?: string | null;
  price: number;
  quantity: number;
};

type OrderDetail = {
  orderNumber: string;
  placedAt: string | null;
  storeName: string;
  status: OrderStatus;
  items: OrderLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentStatus: string | null;
  discountCode: string | null;
  discountName: string | null;
  discountAmount: number;
  shippingMethod: string;
  address: string[];
  trackingNumber?: string | null;
};

type RawOrderItem = {
  productId?: number;
  name?: string;
  game?: string;
  imageUrl?: string | null;
  price?: number;
  quantity?: number;
};

type RawOrder = {
  orderNumber?: string;
  createdAt?: string | null;
  storeName?: string;
  status?: string;
  total?: number;
  subtotal?: number | null;
  paymentStatus?: string | null;
  discountCode?: string | null;
  discountName?: string | null;
  discountAmount?: number | null;
  shippingMethod?: string;
  shippingFee?: number;
  shippingAddress?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  trackingNumber?: string | null;
  items?: RawOrderItem[];
};

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

const toOrderStatus = (status?: string): OrderStatus => {
  if (status === 'Shipped' || status === 'Delivered' || status === 'Canceled') return status;
  return 'Processing';
};

const amount = (value?: number) => typeof value === 'number' && Number.isFinite(value) ? value : 0;

const formatOrderDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(date);
};

const formatDeliveryMethod = (method: string) => {
  if (method.toLowerCase() === 'pickup') return 'Store pickup';
  if (method.toLowerCase() === 'standard') return 'Standard delivery';
  return method || 'Delivery method not specified';
};

const timelineFor = (order: OrderDetail): TimelineStep[] => {
  const orderPlacedAt = formatOrderDate(order.placedAt);
  if (order.status === 'Canceled') {
    return [
      { label: 'Order placed', description: 'Your order was placed successfully.', timestamp: orderPlacedAt, state: 'completed' },
      { label: 'Canceled', description: 'This order was canceled.', timestamp: 'Current status', state: 'current' },
    ];
  }

  const steps: Array<Omit<TimelineStep, 'state' | 'timestamp'>> = [
    { label: 'Order placed', description: 'Your order was placed successfully.' },
    { label: 'Processing', description: 'The store is preparing your order.' },
    { label: 'Shipped', description: 'The order has been shipped.' },
    { label: 'Delivered', description: 'The order was marked as delivered.' },
  ];
  const statusRank: Record<Exclude<OrderStatus, 'Canceled'>, number> = { Processing: 1, Shipped: 2, Delivered: 3 };
  const currentRank = statusRank[order.status as Exclude<OrderStatus, 'Canceled'>];
  const orderCompleted = order.status === 'Delivered';

  return steps.map((step, index) => ({
    ...step,
    description: orderCompleted && index === 3
      ? 'Your order was delivered successfully. This order is complete.'
      : step.description,
    state: orderCompleted || index < currentRank ? 'completed' : index === currentRank ? 'current' : 'upcoming',
    timestamp: index === 0 ? orderPlacedAt : orderCompleted ? 'Completed' : index === currentRank ? 'Current status' : '—',
  }));
};

const toOrderDetail = (raw: RawOrder): OrderDetail => {
  const shippingFee = amount(raw.shippingFee);
  const total = amount(raw.total);
  const shippingMethod = raw.shippingMethod ?? '';
  const isPickup = shippingMethod.toLowerCase() === 'pickup';
  const address = isPickup
    ? [raw.storeName || 'Store information unavailable', 'Store pickup']
    : [raw.recipientName, raw.shippingAddress, raw.recipientPhone].filter((line): line is string => Boolean(line?.trim()));

  const items = (raw.items ?? []).map((item, index) => ({
    productId: item.productId ?? index,
    name: item.name ?? 'Product unavailable',
    game: item.game ?? 'Card game not specified',
    imageUrl: item.imageUrl,
    price: amount(item.price),
    quantity: item.quantity ?? 0,
  }));
  const discountAmount = amount(raw.discountAmount ?? undefined);
  // Orders placed before discounts existed have no stored subtotal, so rebuild it from the lines.
  const subtotal = typeof raw.subtotal === 'number'
    ? raw.subtotal
    : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return {
    orderNumber: raw.orderNumber ?? '—',
    placedAt: raw.createdAt ?? null,
    storeName: raw.storeName ?? 'Store information unavailable',
    status: toOrderStatus(raw.status),
    items,
    subtotal,
    shippingFee,
    total,
    paymentStatus: raw.paymentStatus ?? null,
    discountCode: raw.discountCode ?? null,
    discountName: raw.discountName ?? null,
    discountAmount,
    shippingMethod,
    address: address.length ? address : ['Delivery address not available'],
    trackingNumber: raw.trackingNumber,
  };
};

export function OrderHistoryDetail() {
  const navigate = useNavigate();
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      if (!orderNumber) {
        setError('Order number is missing.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderNumber)}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null) as RawOrder | { message?: string } | null;
        if (!response.ok) {
          const message = data && 'message' in data ? data.message : null;
          throw new Error(message || (response.status === 404 ? 'Order not found or you do not have access to it.' : 'Could not load order details.'));
        }
        setOrder(toOrderDetail(data as RawOrder));
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load order details.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void load();
    window.scrollTo({ top: 0, behavior: 'auto' });
    return () => controller.abort();
  }, [navigate, orderNumber]);

  const timeline = useMemo(() => order ? timelineFor(order) : [], [order]);

  if (isLoading) {
    return <section className="min-h-full bg-[#f6f8fb] px-5 py-24 text-center text-sm text-[#697381]">Loading order details…</section>;
  }

  if (!order) {
    return (
      <section className="min-h-full bg-[#f6f8fb] px-5 py-24 text-center">
        <p role="alert" className="text-sm font-semibold text-[#c13c3c]">{error ?? 'Order not found.'}</p>
        <button type="button" onClick={() => navigate('/order-history')} className="mt-4 text-sm font-bold text-[#2f65ff]">← Back to order history</button>
      </section>
    );
  }

  const hasTrackingNumber = Boolean(order.trackingNumber?.trim());
  const deliveryHeading = order.shippingMethod.toLowerCase() === 'pickup' ? 'Pickup information' : 'Shipping address';
  const deliverySubheading = order.shippingMethod.toLowerCase() === 'pickup' ? 'Collection details' : 'Delivery address';

  return (
    <section className="min-h-full bg-[#f6f8fb] font-sans text-[#20242b]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button type="button" onClick={() => navigate('/order-history')} className="mb-4 flex items-center gap-1 text-[10px] font-bold text-[#2f65ff] transition hover:text-[#1647c4] cursor-pointer">
              ← Back to order history
            </button>
            <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-2 text-[10px] font-medium text-[#a1a8b3]">
              <Link className="transition hover:text-[#2f65ff]" to="/">Home</Link><span>/</span>
              <Link className="transition hover:text-[#2f65ff]" to="/order-history">Order History</Link><span>/</span>
              <span className="text-[#59616d]">Detail</span>
            </nav>
            <h1 className="text-2xl font-black tracking-tight text-[#171a20] sm:text-3xl">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-[10px] text-[#9198a3]">Placed on {formatOrderDate(order.placedAt)} · Sold by {order.storeName}</p>
          </div>
          <span className={`w-fit rounded-full px-2.5 py-1.5 text-[10px] font-bold ${statusStyles[order.status]}`}>• {order.status}</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)]">
          <div className="space-y-3">
            <OrderSummary order={{
              orderNumber: order.orderNumber,
              placedAt: formatOrderDate(order.placedAt),
              storeName: order.storeName,
              status: order.status,
              paymentStatus: order.paymentStatus,
              items: order.items.map((item) => ({ key: `${item.productId}-${item.name}`, name: item.name, game: item.game, price: item.price, quantity: item.quantity })),
              subtotal: order.subtotal,
              discountCode: order.discountCode,
              discountName: order.discountName,
              discountAmount: order.discountAmount,
              shippingFee: order.shippingFee,
              total: order.total,
              address: order.address,
            }} />

            <div className="flex items-start gap-2 rounded-xl border border-[#e4e8ee] bg-white px-4 py-3 text-[10px] text-[#89929e] shadow-[0_3px_12px_rgba(27,39,63,0.04)]">
              <span className="mt-0.5 text-[#2f65ff]">ⓘ</span><p>Need help with this order? Contact the store first, or reach out to Optracard support if you need further assistance.</p>
            </div>
          </div>

          <div className="space-y-3">
            <OrderDetailPanel title={deliveryHeading} subtitle={deliverySubheading} headerRight={<span className="text-[10px] text-[#a1a8b3]">⌖</span>}>
              <div className="space-y-0.5 text-[10px] leading-relaxed text-[#697381]">
                {order.address.map((line, index) => <p key={`${line}-${index}`} className={index === 0 ? 'font-bold text-[#303844]' : ''}>{line}</p>)}
              </div>
            </OrderDetailPanel>

            <OrderDetailPanel title="Tracking information" subtitle={hasTrackingNumber ? 'Tracking number provided by the store' : 'A tracking number has not been assigned yet'} headerRight={<span className={`rounded-full px-2 py-1 text-[9px] font-bold ${hasTrackingNumber ? 'bg-[#edf4ff] text-[#2f65ff]' : 'bg-[#f2f4f7] text-[#7d8794]'}`}>• {hasTrackingNumber ? 'Available' : 'Not assigned'}</span>}>
              {hasTrackingNumber && <p className="text-xs font-bold text-[#2f65ff]">{order.trackingNumber}</p>}
              <p className={`${hasTrackingNumber ? 'mt-1' : ''} text-[10px] text-[#a1a8b3]`}>{formatDeliveryMethod(order.shippingMethod)}</p>
            </OrderDetailPanel>

            <OrderDetailPanel
              title="Order timeline"
              subtitle={order.status === 'Delivered' ? 'Delivery completed' : 'Status from your order record'}
              headerRight={order.status === 'Delivered' ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#eafaf3] px-2 py-1 text-[9px] font-bold text-[#159568]">
                  <CheckCircle2 className="h-3 w-3" /> Complete
                </span>
              ) : undefined}
            >
              <ol className={`relative space-y-4 before:absolute before:bottom-2 before:left-[4px] before:top-2 before:w-px ${order.status === 'Delivered' ? 'before:bg-[#b8e6d2]' : 'before:bg-[#e5e9ef]'}`}>
                {timeline.map((step) => (
                  <li key={step.label} className="relative grid grid-cols-[10px_minmax(0,1fr)_auto] items-start gap-3">
                    <span className={`z-10 mt-0.5 h-[9px] w-[9px] rounded-full border-2 ${timelineDotStyles[step.state]}`} />
                    <div className="min-w-0"><p className={`text-[10px] font-bold ${step.state === 'upcoming' ? 'text-[#8e97a3]' : 'text-[#303844]'}`}>{step.label}</p><p className="mt-0.5 text-[9px] leading-relaxed text-[#a1a8b3]">{step.description}</p></div>
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

import { formatPrice } from '../context/formatters';
import { Link } from 'react-router-dom';

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';

export interface OrderItem {
  id: string;
  name: string;
  detail: string;
  price: number;
  quantity: number;
  imageTone: 'orange' | 'red' | 'blue' | 'purple' | 'green';
}

interface OrderHistoryCardProps {
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
}

const statusStyles: Record<OrderStatus, string> = {
  Processing: 'bg-[#fff5dc] text-[#b47a00]',
  Shipped: 'bg-[#edf4ff] text-[#2f65ff]',
  Delivered: 'bg-[#eafaf3] text-[#159568]',
  Canceled: 'bg-[#fff0f0] text-[#dc4c4c]',
};

const imageToneStyles: Record<OrderItem['imageTone'], string> = {
  orange: 'bg-gray-100',
  red: 'bg-gray-100',
  blue: 'bg-gray-100',
  purple: 'bg-gray-100',
  green: 'bg-gray-100',
};

const actionStyles = {
  link: 'text-[#2f65ff] hover:text-[#1647c4]',
  outline: 'border border-[#dce1e8] bg-white text-[#657080] hover:border-[#2f65ff] hover:text-[#2f65ff]',
  primary: 'bg-[#2f65ff] text-white shadow-[0_3px_8px_rgba(47,101,255,0.22)] hover:bg-[#1647c4]',
};

export const OrderHistoryCard = ({
  orderNumber,
  placedAt,
  store,
  status,
  items,
  total,
  statusNote,
  actions,
}: OrderHistoryCardProps) => {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e4e8ee] bg-white shadow-[0_3px_12px_rgba(27,39,63,0.05)]">
      <header className="flex flex-col gap-2 border-b border-[#edf0f4] px-5 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold text-[#2d3440]">Order #{orderNumber}</p>
          <p className="mt-1 text-[10px] text-[#a1a8b3]">Placed on {placedAt} · {store}</p>
        </div>
        <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[status]}`}>
          • {status}
        </span>
      </header>

      <div className="px-5 py-3.5">
        <p className="text-[10px] font-semibold text-[#697381]">
          Sold by <span className="text-[#353d49]">{store}</span> · {items.length} {items.length === 1 ? 'item' : 'items'}
        </p>

        <div className="mt-1 divide-y divide-[#f0f2f5]">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-11 w-9 flex-shrink-0 items-center justify-center rounded-sm ${imageToneStyles[item.imageTone]}`}>
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
      </div>

      <footer className="flex flex-col gap-4 border-t border-[#edf0f4] px-5 py-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] text-[#a1a8b3]">Order total</p>
          <p className="mt-0.5 text-lg font-black text-[#2f65ff]">{formatPrice(total)}</p>
          <p className={`mt-0.5 text-[10px] font-semibold ${status === 'Processing' ? 'text-[#d39419]' : 'text-[#18a36b]'}`}>
            {statusNote}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          {actions.map((action) => (
            action.to ? (
              <Link
                key={action.label}
                to={action.to}
                className={`rounded-md px-3 py-2 text-[10px] font-bold transition ${actionStyles[action.variant]}`}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                className={`rounded-md px-3 py-2 text-[10px] font-bold transition ${actionStyles[action.variant]}`}
              >
                {action.label}
              </button>
            )
          ))}
        </div>
      </footer>
    </article>
  );
};

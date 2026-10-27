import { Printer } from 'lucide-react';
import { formatPrice } from '../context/formatters';

export type OrderSummaryLine = {
  key: string;
  name: string;
  game: string;
  price: number;
  quantity: number;
};

export type OrderSummaryData = {
  orderNumber: string;
  /** Already formatted for display. */
  placedAt: string;
  storeName: string;
  status: string;
  paymentStatus: string | null;
  items: OrderSummaryLine[];
  subtotal: number;
  discountCode?: string | null;
  discountName?: string | null;
  discountAmount: number;
  shippingFee: number;
  total: number;
  /** Recipient, address and phone lines. Shown on the printed copy only. */
  address: string[];
};

export const paymentStatusLabel = (status: string | null | undefined): string => {
  const value = status?.trim();
  if (!value) return 'Not recorded';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

/**
 * Printable order summary shared by the buyer and admin order pages.
 * Printing shows only this block (see the print rules in index.css), so
 * "Save as PDF" in the browser's print dialog produces a clean summary.
 */
export function OrderSummary({ order }: { order: OrderSummaryData }) {
  const hasDiscount = order.discountAmount > 0;
  const discountLabel = [order.discountName, order.discountCode && `(${order.discountCode})`].filter(Boolean).join(' ');

  return (
    <section aria-label="Order summary" className="print-area rounded-xl border border-[#e4e8ee] bg-white p-5 shadow-[0_3px_12px_rgba(27,39,63,0.05)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf0f4] pb-4">
        <div>
          <h2 className="text-base font-black text-[#171a20]">Order summary</h2>
          <p className="mt-1 text-sm font-bold text-[#303844]">Order #{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-[#697381]">Placed {order.placedAt} · Sold by {order.storeName}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="print:hidden inline-flex items-center gap-2 rounded-md border border-[#dce1e8] bg-white px-3 py-2 text-xs font-bold text-[#303844] hover:border-[#2f65ff] hover:text-[#2f65ff] cursor-pointer"
          title="Opens the print dialog. Choose Save as PDF as the destination to keep a copy."
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-[#929aa6]">
            <th className="py-2 font-semibold">Item</th>
            <th className="py-2 text-right font-semibold">Price</th>
            <th className="py-2 text-right font-semibold">Qty</th>
            <th className="py-2 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f2f5]">
          {order.items.map((item) => (
            <tr key={item.key}>
              <td className="py-2.5 pr-3">
                <p className="font-bold text-[#303844]">{item.name}</p>
                <p className="text-xs text-[#a1a8b3]">{item.game}</p>
              </td>
              <td className="py-2.5 text-right">{formatPrice(item.price)}</td>
              <td className="py-2.5 text-right">{item.quantity}</td>
              <td className="py-2.5 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-3 space-y-1.5 border-t border-[#edf0f4] pt-3 text-sm">
        <div className="flex justify-between text-[#697381]"><dt>Items subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
        {hasDiscount && (
          <div className="flex justify-between text-[#18a36b]"><dt>Discount{discountLabel ? ` · ${discountLabel}` : ''}</dt><dd>−{formatPrice(order.discountAmount)}</dd></div>
        )}
        <div className="flex justify-between text-[#697381]"><dt>Shipping fee</dt><dd>{order.shippingFee === 0 ? 'Free' : formatPrice(order.shippingFee)}</dd></div>
        <div className="flex justify-between border-t border-[#edf0f4] pt-2 text-base font-black text-[#171a20]"><dt>Net total</dt><dd>{formatPrice(order.total)}</dd></div>
      </dl>

      <dl className="mt-4 grid gap-3 border-t border-[#edf0f4] pt-3 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-[#929aa6]">Payment status</dt><dd className="font-bold text-[#303844]">{paymentStatusLabel(order.paymentStatus)}</dd></div>
        <div><dt className="text-xs text-[#929aa6]">Order status</dt><dd className="font-bold text-[#303844]">{order.status}</dd></div>
        <div className="hidden print:block sm:col-span-2">
          <dt className="text-xs text-[#929aa6]">Delivery address</dt>
          <dd className="font-bold text-[#303844]">{order.address.map((line, index) => <p key={`${line}-${index}`} className="whitespace-pre-wrap">{line}</p>)}</dd>
        </div>
      </dl>
    </section>
  );
}

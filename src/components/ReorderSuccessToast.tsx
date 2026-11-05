import { useEffect } from 'react';
import { CheckCircle2, ShoppingCart, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ReorderResult } from '../api/orders';

type ReorderSuccessToastProps = {
  result: ReorderResult;
  onDismiss: () => void;
};

/** A short, visible confirmation that a completed reorder changed the cart. */
export function ReorderSuccessToast({ result, onDismiss }: ReorderSuccessToastProps) {
  const addedQuantity = result.added.reduce((total, line) => total + line.addedQuantity, 0);

  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5_000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, result.orderNumber]);

  return (
    <div role="status" aria-live="polite" aria-label="Cart updated" className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-xl sm:bottom-6 sm:right-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">Added to your cart</p>
          <p className="mt-1 text-sm text-emerald-800">{addedQuantity} {addedQuantity === 1 ? 'item' : 'items'} from order #{result.orderNumber} {addedQuantity === 1 ? 'is' : 'are'} now in your cart.</p>
          <Link to="/cart" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 underline underline-offset-2 hover:text-emerald-950"><ShoppingCart aria-hidden="true" className="h-4 w-4" />Review cart</Link>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss cart update" className="rounded p-0.5 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-950"><X aria-hidden="true" className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

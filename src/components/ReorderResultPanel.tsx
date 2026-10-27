import { Link } from 'react-router-dom';
import type { ReorderResult } from '../api/orders';

type ReorderResultPanelProps = {
  result: ReorderResult;
  onDismiss: () => void;
};

/** Tells the buyer exactly what a reorder put in the cart and what it could not. */
export function ReorderResultPanel({ result, onDismiss }: ReorderResultPanelProps) {
  const nothingAdded = result.addedCount === 0;
  const limited = result.added.filter((line) => line.reason);
  const tone = nothingAdded
    ? 'border-red-200 bg-red-50 text-red-800'
    : result.skippedCount > 0 || limited.length > 0
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-green-200 bg-green-50 text-green-800';

  return (
    <div role="status" aria-label="Reorder result" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${tone}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="font-bold">
          {nothingAdded
            ? `Nothing from order #${result.orderNumber} could be added to your cart.`
            : `${result.addedCount} ${result.addedCount === 1 ? 'item' : 'items'} from order #${result.orderNumber} added to your cart.`}
        </p>
        <button type="button" onClick={onDismiss} aria-label="Dismiss reorder result" className="text-lg leading-none opacity-60 hover:opacity-100">×</button>
      </div>

      {(result.skipped.length > 0 || limited.length > 0) && (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {limited.map((line) => <li key={`limited-${line.productId}`}>{line.message}</li>)}
          {result.skipped.map((line) => <li key={`skipped-${line.productId}`}>{line.message}</li>)}
        </ul>
      )}

      {!nothingAdded && (
        <Link to="/cart" className="mt-3 inline-block rounded-md bg-[#2f65ff] px-3 py-2 text-xs font-bold text-white hover:bg-[#1647c4]">Go to cart</Link>
      )}
    </div>
  );
}

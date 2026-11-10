import { AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

type ReorderErrorToastProps = {
  message: string;
  onDismiss: () => void;
};

/** A brief, visible explanation when an order cannot be put back into the cart. */
export function ReorderErrorToast({ message, onDismiss }: ReorderErrorToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 5_000);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return <div role="alert" aria-live="assertive" className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-red-950 shadow-xl sm:bottom-6 sm:right-6"><div className="flex items-start gap-3"><AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" /><div className="min-w-0 flex-1"><p className="font-bold">Could not reorder this order</p><p className="mt-1 text-sm text-red-800">{message}</p></div><button type="button" onClick={onDismiss} aria-label="Dismiss reorder error" className="rounded p-0.5 text-red-700 hover:bg-red-100 hover:text-red-950"><X aria-hidden="true" className="h-4 w-4" /></button></div></div>;
}

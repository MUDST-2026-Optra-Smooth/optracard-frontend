import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

type CartFeedback = { message: string; tone: 'success' | 'error' };

/** A single floating response for every card's add-to-cart action. */
export const CartFeedbackToast = () => {
  const [feedback, setFeedback] = useState<CartFeedback | null>(null);

  useEffect(() => {
    let timeout: number | undefined;
    const handleFeedback = (event: Event) => {
      const detail = (event as CustomEvent<CartFeedback>).detail;
      if (!detail?.message) return;
      setFeedback(detail);
      window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setFeedback(null), 3600);
    };
    window.addEventListener('cart-feedback', handleFeedback);
    return () => {
      window.removeEventListener('cart-feedback', handleFeedback);
      window.clearTimeout(timeout);
    };
  }, []);

  if (!feedback) return null;
  const success = feedback.tone === 'success';
  const Icon = success ? CheckCircle2 : XCircle;
  return (
    <div role={success ? 'status' : 'alert'} className={`fixed bottom-5 right-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-xl ${success ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${success ? 'text-emerald-600' : 'text-red-600'}`} />
      <div><p className="text-sm font-bold">{success ? 'Added to cart' : 'Could not add to cart'}</p><p className="mt-0.5 text-xs leading-5">{feedback.message}</p></div>
      <button type="button" onClick={() => setFeedback(null)} className="ml-1 text-sm font-bold opacity-60 hover:opacity-100" aria-label="Dismiss message">×</button>
    </div>
  );
};

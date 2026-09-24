export const SPAD_Loading = ({ label = 'Loading data from the database…' }: { label?: string }) => (
  <div className="rounded-lg border border-[#e1e6ee] bg-white px-5 py-12 text-center text-sm text-[#687486]">{label}</div>
);

export const SPAD_Error = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
    <p>{message}</p>
    {onRetry && <button type="button" onClick={onRetry} className="mt-3 rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white cursor-pointer hover:bg-red-700">Try again</button>}
  </div>
);

export const formatCurrency = (value: number | null | undefined) => new Intl.NumberFormat('th-TH', {
  style: 'currency', currency: 'THB', minimumFractionDigits: 2,
}).format(value ?? 0);

export const formatDate = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—';

export const statusTone = (value: string | null | undefined): 'blue' | 'green' | 'orange' | 'red' | 'neutral' => {
  const normalized = value?.toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'ACTIVE' || normalized === 'DELIVERED') return 'green';
  if (normalized === 'PENDING' || normalized === 'PROCESSING' || normalized === 'SHIPPED') return 'orange';
  if (normalized === 'REJECTED' || normalized === 'CANCELED' || normalized === 'CANCELLED' || normalized === 'INACTIVE') return 'red';
  return 'neutral';
};

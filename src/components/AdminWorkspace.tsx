import type { ReactNode } from 'react';
import ADsidebar from './ADsidebar';

interface AdminWorkspaceProps {
  currentTab: string;
  children: ReactNode;
}

export const AdminWorkspace = ({ currentTab, children }: AdminWorkspaceProps) => (
  <div className="flex min-h-screen bg-slate-50 text-slate-800">
    <ADsidebar currentTab={currentTab} />
    <main className="admin-workspace min-w-0 flex-1 pt-16">
      <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">{children}</div>
    </main>
  </div>
);

export const AdminLoading = ({ label = 'Loading data…' }: { label?: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center text-sm text-slate-500 shadow-sm">{label}</div>
);

export const AdminError = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <span>{message}</span>
    {onRetry && <button type="button" onClick={onRetry} className="font-bold underline underline-offset-2">Try again</button>}
  </div>
);

export const formatCurrency = (value: number | null | undefined) => `฿${Number(value ?? 0).toLocaleString(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

export const formatDate = (value: string | null | undefined) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : '—';

export const statusClass = (status: string | null | undefined) => {
  const value = status?.toUpperCase();
  if (value === 'APPROVED' || value === 'DELIVERED' || value === 'PAID' || value === 'ACTIVE') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (value === 'PENDING' || value === 'PROCESSING') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (value === 'REJECTED' || value === 'CANCELED' || value === 'CANCELLED' || value === 'FAILED' || value === 'INACTIVE' || value === 'UNACTIVE') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

export const StatusBadge = ({ status }: { status: string | null | undefined }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(status)}`}>{status ?? 'Unknown'}</span>
);

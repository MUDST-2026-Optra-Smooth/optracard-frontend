import { AlertTriangle, Bell, CheckCheck, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  loadStockAlerts,
  markAllStockAlertsRead,
  markStockAlertRead,
  type StockAlert,
} from '../api/stockAlerts';

const STAFF_ROLES = new Set(['SELLER', 'ADMIN']);

const formatAlertDate = (value: string | null) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Just now';

const alertLabel = (alert: StockAlert) => alert.alertType === 'OUT_OF_STOCK' ? 'Out of stock' : 'Low stock';

export const StockAlertBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const canView = Boolean(user && STAFF_ROLES.has(user.role));
  const unreadCount = alerts.filter((alert) => !alert.read).length;

  const load = useCallback(() => {
    if (!canView) {
      setAlerts([]);
      return Promise.resolve();
    }
    setLoading(true);
    return loadStockAlerts()
      .then(setAlerts)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [canView]);

  useEffect(() => {
    void load();
    if (!canView) return undefined;
    const interval = window.setInterval(() => void load(), 30_000);
    return () => window.clearInterval(interval);
  }, [canView, load, user?.email]);

  useEffect(() => {
    if (!open) return undefined;

    const closeWhenClickedOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !rootRef.current?.contains(target)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', closeWhenClickedOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeWhenClickedOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  const visibleAlerts = useMemo(() => alerts.slice(0, 8), [alerts]);

  if (!canView) return null;

  const targetPath = (alert: StockAlert) => {
    if (user?.role === 'SELLER') return `/edit-product/${alert.productId}`;
    return alert.listingSource === 'MARKETPLACE'
      ? `/admin/marketplace/products/${alert.productId}`
      : `/admin/products/${alert.productId}/edit`;
  };

  const openAlert = async (alert: StockAlert) => {
    if (!alert.read) {
      await markStockAlertRead(alert.id).catch(() => undefined);
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, read: true } : item));
    }
    setOpen(false);
    navigate(targetPath(alert));
  };

  const markAllRead = async () => {
    if (!unreadCount) return;
    await markAllStockAlertsRead().catch(() => undefined);
    setAlerts((current) => current.map((alert) => ({ ...alert, read: true })));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Stock alerts"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-700 bg-[#101827] text-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
            <div>
              <p className="text-sm font-bold">Stock alerts</p>
              <p className="mt-0.5 text-[10px] text-slate-400">Live inventory warnings for your permitted scope</p>
            </div>
            <button
              type="button"
              disabled={!unreadCount}
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-300 hover:text-blue-200 disabled:cursor-not-allowed disabled:text-slate-600 cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          </div>

          {loading && alerts.length === 0 ? (
            <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-slate-400">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Loading alerts…
            </div>
          ) : visibleAlerts.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-slate-400">No low-stock or out-of-stock products.</p>
          ) : (
            <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
              {visibleAlerts.map((alert) => (
                <button
                  key={alert.id}
                  type="button"
                  onClick={() => void openAlert(alert)}
                  className={`w-full border-b border-slate-800 px-4 py-3 text-left transition hover:bg-slate-800/80 cursor-pointer ${alert.read ? 'opacity-75' : 'bg-slate-800/35'}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${alert.alertType === 'OUT_OF_STOCK' ? 'text-rose-400' : 'text-amber-300'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-slate-100">{alert.productName}</p>
                        {!alert.read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" aria-label="Unread" />}
                      </div>
                      <p className={`mt-1 text-[11px] font-semibold ${alert.alertType === 'OUT_OF_STOCK' ? 'text-rose-300' : 'text-amber-200'}`}>
                        {alertLabel(alert)} · {alert.stock} left · threshold {alert.threshold}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-slate-400">{alert.storeName} · {formatAlertDate(alert.activatedAt)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

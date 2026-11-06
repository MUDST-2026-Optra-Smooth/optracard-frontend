export type StockAlertType = 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface StockAlert {
  id: number;
  productId: number;
  productName: string;
  alertType: StockAlertType;
  stock: number;
  threshold: number;
  listingSource: 'OFFICIAL' | 'MARKETPLACE';
  storeId: number | null;
  storeName: string;
  activatedAt: string | null;
  updatedAt: string | null;
  read: boolean;
}

export interface StockAlertSettings {
  defaultThreshold: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message ?? `Request failed with status ${response.status}`);
  return data as T;
};

export const loadStockAlerts = () => request<StockAlert[]>('/api/stock-alerts');
export const markStockAlertRead = (id: number) => request<void>(`/api/stock-alerts/${id}/read`, { method: 'PUT' });
export const markStockAlertUnread = (id: number) => request<void>(`/api/stock-alerts/${id}/unread`, { method: 'PUT' });
export const markAllStockAlertsRead = () => request<void>('/api/stock-alerts/read-all', { method: 'PUT' });
export const loadStockAlertSettings = () => request<StockAlertSettings>('/api/stock-alerts/settings');
export const updateStockAlertSettings = (defaultThreshold: number) => request<StockAlertSettings>('/api/stock-alerts/settings', {
  method: 'PUT',
  body: JSON.stringify({ defaultThreshold }),
});

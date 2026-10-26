import type {
  AdminCardGame,
  AdminDashboard,
  AdminOrder,
  AdminProduct,
  AdminProductInput,
  AdminStore,
} from '../types/admin';
import type { StockAlertSettings } from './stockAlerts';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

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

export const loadAdminDashboard = () => request<AdminDashboard>('/api/admin/dashboard');
export const loadStockAlertSettings = () => request<StockAlertSettings>('/api/stock-alerts/settings');
export const updateStockAlertSettings = (defaultThreshold: number) => request<StockAlertSettings>('/api/stock-alerts/settings', {
  method: 'PUT', body: JSON.stringify({ defaultThreshold }),
});
export const loadAdminCardGames = () => request<AdminCardGame[]>('/api/admin/card-games');
export const loadAdminProducts = () => request<AdminProduct[]>('/api/admin/products');
export const loadAdminProduct = (id: number) => request<AdminProduct>(`/api/admin/products/${id}`);
export const createAdminProduct = (product: AdminProductInput) => request<AdminProduct>('/api/admin/products', {
  method: 'POST', body: JSON.stringify(product),
});
export const updateAdminProduct = (id: number, product: AdminProductInput) => request<AdminProduct>(`/api/admin/products/${id}`, {
  method: 'PUT', body: JSON.stringify(product),
});
export const updateAdminProductActive = (id: number, active: boolean) => request<AdminProduct>(`/api/admin/products/${id}/active`, {
  method: 'PUT', body: JSON.stringify({ active }),
});
export const deleteAdminProduct = (id: number) => request<void>(`/api/admin/products/${id}`, { method: 'DELETE' });

export type AdminOrderSource = 'OFFICIAL' | 'MARKETPLACE' | 'ALL';

export const loadAdminOrders = (source: AdminOrderSource = 'OFFICIAL') => request<AdminOrder[]>(
  `/api/admin/orders?source=${encodeURIComponent(source)}`,
);
export const loadAdminOrder = (id: number) => request<AdminOrder>(`/api/admin/orders/${id}`);
export const updateAdminOrderStatus = (id: number, status: string, trackingNumber?: string) => request<AdminOrder>(`/api/admin/orders/${id}/status`, {
  method: 'PUT', body: JSON.stringify({ status, trackingNumber }),
});

export const loadAdminStores = (status = 'ALL') => request<AdminStore[]>(`/api/admin/stores?status=${encodeURIComponent(status)}`);
export const loadAdminStore = (id: number) => request<AdminStore>(`/api/admin/stores/${id}`);
export const reviewAdminStore = (id: number, status: 'APPROVED' | 'REJECTED' | 'PENDING', note = '') => request<AdminStore>(`/api/admin/stores/${id}/review`, {
  method: 'PUT', body: JSON.stringify({ status, note }),
});

export const loadAdminMarketplaceProducts = (storeId?: number) => request<AdminProduct[]>(
  `/api/admin/marketplace/products${storeId === undefined ? '' : `?storeId=${storeId}`}`,
);
export const loadAdminMarketplaceProduct = (id: number) => request<AdminProduct>(`/api/admin/marketplace/products/${id}`);

export const loadMarketplaceRequests = (status = 'ALL') => request<AdminProduct[]>(
  `/api/admin/marketplace/requests?status=${encodeURIComponent(status)}`,
);
export const approveMarketplaceRequest = (id: number) => request<AdminProduct>(
  `/api/admin/marketplace/requests/${id}/approve`, { method: 'PUT' },
);
export const rejectMarketplaceRequest = (id: number, note = '') => request<AdminProduct>(
  `/api/admin/marketplace/requests/${id}/reject`, {
    method: 'PUT', body: JSON.stringify({ note }),
  },
);

export interface TopProductResponse {
  productId: number;
  name: string;
  soldQuantity: number;
}

export interface WeeklyReportResponse {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  orderCount: number;
  itemsSold: number;
  lowStockCount: number;
  outOfStockCount: number;
  topProducts: TopProductResponse[];
}

export interface RestockPredictionResponse {
  productId: number;
  name: string;
  currentStock: number;
  avgDailySales: number | null;
  daysUntilOut: number | null;
  recommendedRestock: number;
  statusMessage: string;
}

export const loadWeeklyReport = (startDate: string, endDate: string) =>
  request<WeeklyReportResponse>(`/api/admin/reports/weekly?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);

export const loadRestockPredictions = () =>
  request<RestockPredictionResponse[]>('/api/admin/reports/restock-predictions');

export const exportWeeklyReportCsv = async (startDate: string, endDate: string): Promise<void> => {
  const token = localStorage.getItem('token');
  const response = await fetch(
    `${API_BASE_URL}/api/admin/reports/weekly/export-csv?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) throw new Error('Failed to export CSV');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `weekly_report_${startDate}_to_${endDate}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};
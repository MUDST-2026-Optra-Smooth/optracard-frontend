import type {
  AdminCardGame,
  AdminDashboard,
  AdminOrder,
  AdminProduct,
  AdminProductInput,
  AdminStore,
} from '../types/admin';

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

export const loadAdminDashboard = () => request<AdminDashboard>('/api/admin/dashboard');
export const loadAdminCardGames = () => request<AdminCardGame[]>('/api/admin/card-games');
export const loadAdminProducts = () => request<AdminProduct[]>('/api/admin/products');
export const loadAdminProduct = (id: number) => request<AdminProduct>(`/api/admin/products/${id}`);
export const createAdminProduct = (product: AdminProductInput) => request<AdminProduct>('/api/admin/products', {
  method: 'POST', body: JSON.stringify(product),
});
export const updateAdminProduct = (id: number, product: AdminProductInput) => request<AdminProduct>(`/api/admin/products/${id}`, {
  method: 'PUT', body: JSON.stringify(product),
});
export const deactivateAdminProduct = (id: number) => request<void>(`/api/admin/products/${id}`, { method: 'DELETE' });

export const loadAdminOrders = () => request<AdminOrder[]>('/api/admin/orders');
export const loadAdminOrder = (id: number) => request<AdminOrder>(`/api/admin/orders/${id}`);
export const updateAdminOrderStatus = (id: number, status: string) => request<AdminOrder>(`/api/admin/orders/${id}/status`, {
  method: 'PUT', body: JSON.stringify({ status }),
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

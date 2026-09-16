import type { SellerOrder, SellerProduct, SellerProductInput, CardGameOption } from '../types/seller';

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

export const loadSellerProducts = () => request<SellerProduct[]>('/api/seller/products');
export const loadSellerGames = () => request<CardGameOption[]>('/api/seller/games');
export const loadSellerProduct = (id: number) => request<SellerProduct>(`/api/seller/products/${id}`);
export const createSellerProduct = (product: SellerProductInput) => request<SellerProduct>('/api/seller/products', {
  method: 'POST', body: JSON.stringify(product),
});
export const updateSellerProduct = (id: number, product: SellerProductInput) => request<SellerProduct>(`/api/seller/products/${id}`, {
  method: 'PUT', body: JSON.stringify(product),
});
export const deactivateSellerProduct = (id: number) => request<void>(`/api/seller/products/${id}`, { method: 'DELETE' });
export const loadSellerOrders = () => request<SellerOrder[]>('/api/seller/orders');
export const updateSellerOrderStatus = (id: number, status: string) => request<SellerOrder>(`/api/seller/orders/${id}/status`, {
  method: 'PUT', body: JSON.stringify({ status }),
});

export const loadMarketplaceRequests = (status = 'ALL') => request<SellerProduct[]>(`/api/admin/marketplace/requests?status=${encodeURIComponent(status)}`);
export const approveMarketplaceRequest = (id: number) => request<SellerProduct>(`/api/admin/marketplace/requests/${id}/approve`, { method: 'PUT' });
export const rejectMarketplaceRequest = (id: number, note = '') => request<SellerProduct>(`/api/admin/marketplace/requests/${id}/reject`, {
  method: 'PUT', body: JSON.stringify({ note }),
});

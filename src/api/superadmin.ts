import type {
  CreateSuperAdminStaffInput,
  SuperAdminCatalogProduct,
  SuperAdminOverview,
  SuperAdminStaff,
  SuperAdminStore,
  SuperAdminTransaction,
  SuperAdminUser,
} from '../types/superadmin';

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

export const loadSuperAdminOverview = () => request<SuperAdminOverview>('/api/superadmin/overview');
export const loadSuperAdminStores = () => request<SuperAdminStore[]>('/api/superadmin/stores');
export const loadSuperAdminStore = (storeId: number) => request<SuperAdminStore>(`/api/superadmin/stores/${storeId}`);
export const loadSuperAdminCatalog = () => request<SuperAdminCatalogProduct[]>('/api/superadmin/catalog');
export const loadSuperAdminTransactions = () => request<SuperAdminTransaction[]>('/api/superadmin/transactions');
export const loadSuperAdminUsers = () => request<SuperAdminUser[]>('/api/superadmin/users');
export const deleteSuperAdminUser = (userId: number, confirmation: string) => request<void>(`/api/superadmin/users/${userId}`, {
  method: 'DELETE', body: JSON.stringify({ confirmation }),
});
export const loadSuperAdminStaff = () => request<SuperAdminStaff[]>('/api/superadmin/staff');
export const deleteSuperAdminStaff = (userId: number, confirmation: string) => request<void>(`/api/superadmin/staff/${userId}`, {
  method: 'DELETE', body: JSON.stringify({ confirmation }),
});
export const createSuperAdminStaff = (staff: CreateSuperAdminStaffInput) => request<SuperAdminStaff>('/api/superadmin/staff', {
  method: 'POST',
  body: JSON.stringify(staff),
});

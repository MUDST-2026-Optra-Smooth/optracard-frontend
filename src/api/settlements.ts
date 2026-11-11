import type {
  MarketplaceFeeConfig,
  SettlementFilters,
  SettlementReport,
} from '../types/settlements';

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

const query = (filters: SettlementFilters) => {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.type && filters.type !== 'ALL') params.set('type', filters.type);
  if (filters.sellerUserId) params.set('sellerUserId', String(filters.sellerUserId));
  if (filters.storeId) params.set('storeId', String(filters.storeId));
  const value = params.toString();
  return value ? `?${value}` : '';
};

export const loadSellerSettlements = (filters: SettlementFilters = {}) =>
  request<SettlementReport>(`/api/seller/settlements${query(filters)}`);

export const loadSuperAdminSettlements = (filters: SettlementFilters = {}) =>
  request<SettlementReport>(`/api/superadmin/settlements${query(filters)}`);

export const loadMarketplaceFeeConfig = () =>
  request<MarketplaceFeeConfig>('/api/superadmin/marketplace-fee/config');

export const loadMarketplaceFeeHistory = () =>
  request<MarketplaceFeeConfig[]>('/api/superadmin/marketplace-fee/config/history');

export const updateMarketplaceFeeConfig = (feeRate: number) =>
  request<MarketplaceFeeConfig>('/api/superadmin/marketplace-fee/config', {
    method: 'PUT',
    body: JSON.stringify({ feeRate }),
  });

import type { Auction, AuctionBid, AuctionCheckoutInput, AuctionInput } from '../types/auction';

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

export const loadAuctions = (filters: Record<string, string> = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'ALL'));
  return request<Auction[]>(`/api/auctions${params.size ? `?${params.toString()}` : ''}`);
};
export const loadAuction = (id: number) => request<Auction>(`/api/auctions/${id}`);
export const loadAuctionBids = (id: number) => request<AuctionBid[]>(`/api/auctions/${id}/bids`);
export const placeAuctionBid = (id: number, amount: number) => request<AuctionBid>(`/api/auctions/${id}/bids`, {
  method: 'POST', body: JSON.stringify({ amount }),
});
export const checkoutAuction = (id: number, payload: AuctionCheckoutInput) => request<Auction>(`/api/auctions/${id}/checkout`, {
  method: 'POST', body: JSON.stringify(payload),
});

export const loadSellerAuctions = () => request<Auction[]>('/api/seller/auctions');
export const createSellerAuction = (payload: AuctionInput) => request<Auction>('/api/seller/auctions', {
  method: 'POST', body: JSON.stringify(payload),
});
export const updateSellerAuction = (id: number, payload: AuctionInput) => request<Auction>(`/api/seller/auctions/${id}`, {
  method: 'PUT', body: JSON.stringify(payload),
});
export const submitSellerAuction = (id: number) => request<Auction>(`/api/seller/auctions/${id}/submit`, { method: 'POST' });
export const cancelSellerAuction = (id: number) => request<Auction>(`/api/seller/auctions/${id}`, { method: 'DELETE' });
export const relistSellerAuction = (id: number, payload: AuctionInput) => request<Auction>(`/api/seller/auctions/${id}/relist`, {
  method: 'POST', body: JSON.stringify(payload),
});

export const loadAdminAuctions = (status = 'ALL') => request<Auction[]>(`/api/admin/auctions?status=${encodeURIComponent(status)}`);
export const createOfficialAuction = (payload: AuctionInput) => request<Auction>('/api/admin/auctions', {
  method: 'POST', body: JSON.stringify(payload),
});
export const reviewAuction = (id: number, approved: boolean, note = '') => request<Auction>(`/api/admin/auctions/${id}/review`, {
  method: 'PUT', body: JSON.stringify({ approved, note }),
});
export const cancelAuctionByAdmin = (id: number, note = '') => request<Auction>(`/api/admin/auctions/${id}/cancel`, {
  method: 'PUT', body: JSON.stringify({ note }),
});

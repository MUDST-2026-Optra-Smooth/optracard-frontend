export type OrderNotification = {
  id: number;
  orderId: number;
  orderNumber: string;
  message: string;
  trackingNumber: string;
  createdAt: string | null;
  read: boolean;
};

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

export const loadOrderNotifications = () => request<OrderNotification[]>('/api/notifications');
export const markOrderNotificationsRead = () => request<void>('/api/notifications/read-all', { method: 'PUT' });

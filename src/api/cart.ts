const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type CartSnapshot = {
  items: Array<{ productId: number; quantity: number }>;
  totalItemCount: number;
};

export function getApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const payload = data as { message?: unknown; detail?: unknown; error?: unknown };
  const message = payload.message ?? payload.detail;
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

export async function addProductToCart(productId: number, userId?: number): Promise<CartSnapshot> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Please log in to add products to your cart.');
  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const profile = await fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
    if (!profile.ok) throw new Error('Please log in again to add products to your cart.');
    resolvedUserId = (await profile.json()).userId;
  }
  const response = await fetch(`${API_BASE_URL}/api/cart/add?userId=${resolvedUserId}&productId=${productId}&quantity=1`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getApiErrorMessage(data, 'Could not add this product to your cart.'));
  window.dispatchEvent(new Event('cart-updated'));
  return data as CartSnapshot;
}

import { getApiErrorMessage } from './cart';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export type ReorderLine = {
  productId: number;
  name: string;
  requestedQuantity: number;
  addedQuantity: number;
  /** UNAVAILABLE, OUT_OF_STOCK or LIMITED_STOCK. Null when the line was added in full. */
  reason: string | null;
  message: string | null;
};

export type ReorderResult = {
  orderNumber: string;
  addedCount: number;
  skippedCount: number;
  added: ReorderLine[];
  skipped: ReorderLine[];
};

/** Puts the items of a past order back into the signed-in buyer's cart. */
export async function reorderOrder(orderNumber: string): Promise<ReorderResult> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Please log in to order again.');

  const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderNumber)}/reorder`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getApiErrorMessage(data, 'Could not add this order to your cart.'));

  window.dispatchEvent(new Event('cart-updated'));
  return data as ReorderResult;
}

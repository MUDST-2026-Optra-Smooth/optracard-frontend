import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reorderOrder } from '../../src/api/orders';

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('reorderOrder', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('posts to the reorder endpoint with the bearer token and refreshes the cart count', async () => {
    const fetchMock = vi.fn(() => jsonResponse({ orderNumber: 'ORD-1', addedCount: 1, skippedCount: 0, added: [], skipped: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const onCartUpdated = vi.fn();
    window.addEventListener('cart-updated', onCartUpdated);

    const result = await reorderOrder('ORD-1');
    window.removeEventListener('cart-updated', onCartUpdated);

    expect(result.addedCount).toBe(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/\/api\/orders\/ORD-1\/reorder$/);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer test-token');
    expect(onCartUpdated).toHaveBeenCalledTimes(1);
  });

  it('surfaces the server message when the order cannot be reordered', async () => {
    vi.stubGlobal('fetch', vi.fn(() => jsonResponse({ message: 'Order not found' }, 404)));

    await expect(reorderOrder('ORD-9')).rejects.toThrow('Order not found');
  });

  it('asks the buyer to log in when there is no token', async () => {
    localStorage.clear();
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(reorderOrder('ORD-1')).rejects.toThrow('Please log in');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

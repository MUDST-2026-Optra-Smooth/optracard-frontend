import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as seller from '../../src/api/seller';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('seller API client', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'seller-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ok: true })));
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('loads seller resources with authorization', async () => {
    const fetchMock = vi.mocked(fetch);
    await seller.loadMyStore();
    await seller.loadSellerProducts();
    await seller.loadSellerGames();
    await seller.loadSellerProduct(3);
    await seller.loadSellerOrders();
    await seller.loadSellerOrder(4);
    expect(fetchMock).toHaveBeenCalledTimes(6);
    for (const [, init] of fetchMock.mock.calls) expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer seller-token');
  });

  it('sends create, update, activation, delete and order-status payloads', async () => {
    const fetchMock = vi.mocked(fetch);
    const product = { name: 'Card', gameId: 1, type: 'Single', price: 100, stock: 2 } as never;
    await seller.createSellerProduct(product);
    await seller.updateSellerProduct(2, product);
    await seller.updateSellerProductActive(2, false);
    await seller.deleteSellerProduct(2);
    await seller.updateSellerOrderStatus(8, 'SHIPPED', 'TRACK-1');
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:8080/api/seller/products',
      'http://localhost:8080/api/seller/products/2',
      'http://localhost:8080/api/seller/products/2/active',
      'http://localhost:8080/api/seller/products/2',
      'http://localhost:8080/api/seller/orders/8/status',
    ]);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', body: JSON.stringify(product) });
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ active: false }) });
    expect(fetchMock.mock.calls[4][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ status: 'SHIPPED', trackingNumber: 'TRACK-1' }) });
  });

  it('supports marketplace request filtering and moderation', async () => {
    const fetchMock = vi.mocked(fetch);
    await seller.loadMarketplaceRequests('PENDING');
    await seller.approveMarketplaceRequest(7);
    await seller.rejectMarketplaceRequest(7, 'Missing image');
    expect(fetchMock.mock.calls[0][0]).toContain('status=PENDING');
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PUT' });
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ note: 'Missing image' }) });
  });

  it('uses server error messages and handles empty response bodies', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ message: 'Seller is not approved' }, 403));
    await expect(seller.loadMyStore()).rejects.toThrow('Seller is not approved');
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }));
    await expect(seller.deleteSellerProduct(1)).resolves.toBeNull();
  });
});

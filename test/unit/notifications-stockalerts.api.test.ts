import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as notifications from '../../src/api/notifications';
import * as stockAlerts from '../../src/api/stockAlerts';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('notification and stock-alert API clients', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'token-1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ok: true })));
  });
  afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

  it('loads and marks order notifications with authorization', async () => {
    const fetchMock = vi.mocked(fetch);
    vi.mocked(fetch).mockResolvedValueOnce(response([{ id: 1, orderId: 2, orderNumber: 'ORD-2', message: 'Shipped', trackingNumber: 'TRK', createdAt: null, read: false }]));
    await expect(notifications.loadOrderNotifications()).resolves.toHaveLength(1);
    await notifications.markOrderNotificationsRead();
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:8080/api/notifications', expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer token-1' }) }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/notifications/read-all', expect.objectContaining({ method: 'PUT' }));
  });

  it('surfaces notification errors and supports every stock-alert action', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ message: 'notifications unavailable' }, 503));
    await expect(notifications.loadOrderNotifications()).rejects.toThrow('notifications unavailable');
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockClear();
    await stockAlerts.loadStockAlerts();
    await stockAlerts.markStockAlertRead(3);
    await stockAlerts.markStockAlertUnread(3);
    await stockAlerts.markAllStockAlertsRead();
    await stockAlerts.loadStockAlertSettings();
    await stockAlerts.updateStockAlertSettings(8);
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:8080/api/stock-alerts',
      'http://localhost:8080/api/stock-alerts/3/read',
      'http://localhost:8080/api/stock-alerts/3/unread',
      'http://localhost:8080/api/stock-alerts/read-all',
      'http://localhost:8080/api/stock-alerts/settings',
      'http://localhost:8080/api/stock-alerts/settings',
    ]);
    expect(fetchMock.mock.calls.at(-1)?.[1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ defaultThreshold: 8 }) });
  });
});

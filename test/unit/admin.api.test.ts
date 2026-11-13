import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as admin from '../../src/api/admin';

const response = (body: unknown, status = 200, headers: Record<string, string> = { 'Content-Type': 'application/json' }) => new Response(
  body instanceof Blob ? body : JSON.stringify(body), { status, headers },
);

describe('admin API client', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'admin-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ok: true })));
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('loads dashboards, products, stores, promotions and reports', async () => {
    await admin.loadAdminDashboard();
    await admin.loadStockAlertSettings();
    await admin.loadAdminCardGames();
    await admin.loadAdminProducts();
    await admin.loadAdminProduct(1);
    await admin.loadAdminPromotions();
    await admin.loadAdminOrders('MARKETPLACE');
    await admin.loadAdminOrder(2);
    await admin.loadAdminStores('PENDING');
    await admin.loadAdminStore(3);
    await admin.loadAdminMarketplaceProducts(4);
    await admin.loadAdminMarketplaceProducts();
    await admin.loadAdminMarketplaceProduct(5);
    await admin.loadMarketplaceRequests('PENDING');
    await admin.loadWeeklyReport('2026-01-01', '2026-01-07');
    await admin.loadRestockPredictions();
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(16);
  });

  it('sends product, promotion, stock, order, store and marketplace mutations', async () => {
    const product = { name: 'Product', gameId: 1, type: 'Single', price: 100, stock: 1 } as never;
    const promotion = { code: 'SAVE10', discountType: 'PERCENTAGE', discountValue: 10 } as never;
    await admin.updateStockAlertSettings(8);
    await admin.createAdminProduct(product);
    await admin.updateAdminProduct(1, product);
    await admin.updateAdminProductActive(1, true);
    await admin.deleteAdminProduct(1);
    await admin.createAdminPromotion(promotion);
    await admin.updateAdminPromotion(2, promotion);
    await admin.deleteAdminPromotion(2);
    await admin.updateAdminOrderStatus(3, 'SHIPPED', 'TRACK-2');
    await admin.reviewAdminStore(4, 'APPROVED', 'Looks good');
    await admin.approveMarketplaceRequest(5);
    await admin.rejectMarketplaceRequest(5, 'Fix image');
    expect(vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === 'PUT').length).toBe(8);
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ defaultThreshold: 8 }) });
  });

  it('exports weekly report CSV and cleans up the temporary download link', async () => {
    const click = vi.fn();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = originalCreate(tagName);
      if (tagName === 'a') Object.defineProperty(element, 'click', { value: click });
      return element;
    });
    vi.mocked(fetch).mockResolvedValueOnce(response(new Blob(['csv']), 200, { 'Content-Type': 'text/csv' }));
    await admin.exportWeeklyReportCsv('2026-01-01', '2026-01-07');
    expect(click).toHaveBeenCalledOnce();
  });

  it('propagates failed requests', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ message: 'Forbidden' }, 403));
    await expect(admin.loadAdminDashboard()).rejects.toThrow('Forbidden');
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
    await expect(admin.exportWeeklyReportCsv('2026-01-01', '2026-01-07')).rejects.toThrow('Failed to export CSV');
  });
});

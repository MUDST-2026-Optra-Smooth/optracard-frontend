import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadSellerSettlements,
  loadSuperAdminSettlements,
  updateMarketplaceFeeConfig,
} from '../../src/api/settlements';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('settlement API client', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('loads only the authenticated sellers settlement report with date and type filters', async () => {
    localStorage.setItem('token', 'seller-token');
    const fetchMock = vi.fn().mockResolvedValue(response({
      summary: { grossAmount: 900, feeAmount: 45, netAmount: 855 }, entries: [],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await loadSellerSettlements({ from: '2026-11-01', to: '2026-11-10', type: 'ORDER_CHARGE' });

    expect(result.summary).toEqual({ grossAmount: 900, feeAmount: 45, netAmount: 855 });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain('/api/seller/settlements?');
    expect(url).toContain('from=2026-11-01');
    expect(url).toContain('type=ORDER_CHARGE');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer seller-token');
  });

  it('sends Super Admin report filters and fee updates to their secured endpoints', async () => {
    localStorage.setItem('token', 'super-admin-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ summary: { grossAmount: 0, feeAmount: 0, netAmount: 0 }, entries: [] }))
      .mockResolvedValueOnce(response({ id: 2, feeRate: 7, effectiveFrom: '2026-11-10T10:00:00', changedBy: 'admin', createdAt: '2026-11-10T10:00:00' }));
    vi.stubGlobal('fetch', fetchMock);

    await loadSuperAdminSettlements({ sellerUserId: 7, storeId: 9, type: 'ALL' });
    await updateMarketplaceFeeConfig(7);

    const [reportUrl] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(reportUrl).toContain('/api/superadmin/settlements?');
    expect(reportUrl).toContain('sellerUserId=7');
    expect(reportUrl).toContain('storeId=9');
    const [configUrl, configInit] = fetchMock.mock.calls[1] as unknown as [string, RequestInit];
    expect(configUrl).toMatch(/\/api\/superadmin\/marketplace-fee\/config$/);
    expect(configInit.method).toBe('PUT');
    expect(configInit.body).toBe(JSON.stringify({ feeRate: 7 }));
  });
});

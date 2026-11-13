import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as superadmin from '../../src/api/superadmin';
import * as auctions from '../../src/api/superadminAuctions';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('superadmin API clients', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'super-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ ok: true })));
  });
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('loads superadmin overview resources and performs account mutations', async () => {
    await superadmin.loadSuperAdminOverview();
    await superadmin.loadSuperAdminStores();
    await superadmin.loadSuperAdminStore(1);
    await superadmin.loadSuperAdminCatalog();
    await superadmin.loadSuperAdminTransactions();
    await superadmin.loadSuperAdminUsers();
    await superadmin.loadSuperAdminStaff();
    await superadmin.deleteSuperAdminUser(2, 'DELETE USER 2');
    await superadmin.deleteSuperAdminStaff(3, 'DELETE STAFF 3');
    await superadmin.createSuperAdminStaff({ username: 'staff', email: 'staff@example.com', role: 'ADMIN' } as never);
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls).toHaveLength(10);
    expect(calls[7][1]).toMatchObject({ method: 'DELETE', body: JSON.stringify({ confirmation: 'DELETE USER 2' }) });
  });

  it('loads auction analytics, settings, audit and disputes', async () => {
    await auctions.loadSuperAuctions({ status: 'LIVE', page: '1' });
    await auctions.loadAuctionSettings();
    await auctions.saveAuctionSettings({ bidIncrement: 50, checkoutHours: 24, antiSnipingMinutes: 5, minDurationHours: 1, maxDurationHours: 72 });
    await auctions.loadAuctionAudit(4);
    await auctions.moderateAuction(4, 'CANCEL', 'Policy violation');
    await auctions.restrictAuctionBidder(8, true, 'Fraud');
    await auctions.loadAuctionDisputes();
    await auctions.resolveAuctionDispute(9, 'RESOLVED', 'Refund issued');
    const calls = vi.mocked(fetch).mock.calls;
    expect(calls[0][0]).toContain('status=LIVE');
    expect(calls[2][1]).toMatchObject({ method: 'PUT' });
    expect(calls[4][1]).toMatchObject({ body: JSON.stringify({ action: 'CANCEL', reason: 'Policy violation' }) });
  });

  it('surfaces server errors from both clients', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ message: 'Not allowed' }, 403));
    await expect(superadmin.loadSuperAdminUsers()).rejects.toThrow('Not allowed');
    vi.mocked(fetch).mockResolvedValueOnce(response({ message: 'Settings locked' }, 409));
    await expect(auctions.loadAuctionSettings()).rejects.toThrow('Settings locked');
  });
});

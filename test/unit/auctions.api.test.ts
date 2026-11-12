import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelAuctionByAdmin,
  cancelSellerAuction,
  checkoutAuction,
  createOfficialAuction,
  createSellerAuction,
  loadAdminAuctions,
  loadAuction,
  loadAuctionBids,
  loadAuctions,
  loadSellerAuctions,
  placeAuctionBid,
  relistSellerAuction,
  reviewAuction,
  submitSellerAuction,
  updateSellerAuction,
} from '../../src/api/auctions';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const input = {
  title: 'Gold Star Pikachu', gameId: 1, type: 'Single', imageUrl: '', description: 'Rare card',
  startingPrice: 500, startsAt: '2026-12-01T10:00:00', endsAt: '2026-12-02T10:00:00',
};

describe('auction API client', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('serializes public filters, ignores ALL, and loads the auction details and bid history', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ id: 7 }))
      .mockResolvedValueOnce(response([]));
    vi.stubGlobal('fetch', fetchMock);

    await loadAuctions({ game: 'Pokemon', source: 'ALL', status: 'LIVE' });
    await loadAuction(7);
    await loadAuctionBids(7);

    expect(fetchMock.mock.calls[0][0]).toContain('/api/auctions?');
    expect(fetchMock.mock.calls[0][0]).toContain('game=Pokemon');
    expect(fetchMock.mock.calls[0][0]).toContain('status=LIVE');
    expect(fetchMock.mock.calls[0][0]).not.toContain('source=');
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/auctions\/7$/);
    expect(fetchMock.mock.calls[2][0]).toMatch(/\/api\/auctions\/7\/bids$/);
  });

  it('sends authenticated buyer bid and checkout payloads', async () => {
    localStorage.setItem('token', 'buyer-token');
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await placeAuctionBid(9, 1250);
    await checkoutAuction(9, {
      recipientName: 'Mew', recipientPhone: '0800000000', shippingAddress: 'Bangkok',
      shippingMethod: 'STANDARD', paymentMethod: 'CARD',
    });

    expect(fetchMock.mock.calls[0][0]).toMatch(/\/api\/auctions\/9\/bids$/);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'POST', body: JSON.stringify({ amount: 1250 }) });
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/auctions\/9\/checkout$/);
    expect((fetchMock.mock.calls[1][1].headers as Record<string, string>).Authorization).toBe('Bearer buyer-token');
  });

  it('uses the seller and administrator lifecycle endpoints with exact mutation payloads', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ id: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await loadSellerAuctions();
    await createSellerAuction(input);
    await updateSellerAuction(1, input);
    await submitSellerAuction(1);
    await cancelSellerAuction(1);
    await relistSellerAuction(1, input);
    await loadAdminAuctions();
    await createOfficialAuction(input);
    await reviewAuction(1, false, 'Needs clearer photos');
    await cancelAuctionByAdmin(1, 'Fraud review');

    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual(expect.arrayContaining([
      expect.stringMatching(/\/api\/seller\/auctions$/),
      expect.stringMatching(/\/api\/seller\/auctions\/1\/submit$/),
      expect.stringMatching(/\/api\/seller\/auctions\/1\/relist$/),
      expect.stringMatching(/\/api\/admin\/auctions\?status=ALL$/),
      expect.stringMatching(/\/api\/admin\/auctions\/1\/review$/),
      expect.stringMatching(/\/api\/admin\/auctions\/1\/cancel$/),
    ]));
    expect(fetchMock.mock.calls[8][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ approved: false, note: 'Needs clearer photos' }) });
    expect(fetchMock.mock.calls[9][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ note: 'Fraud review' }) });
  });

  it('returns the server explanation for a rejected bid and a safe status fallback for malformed errors', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ message: 'Bid must be at least ฿1,250' }, 422))
      .mockResolvedValueOnce(new Response('unavailable', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(placeAuctionBid(1, 1000)).rejects.toThrow('Bid must be at least ฿1,250');
    await expect(loadAuction(1)).rejects.toThrow('Request failed with status 503');
  });
});

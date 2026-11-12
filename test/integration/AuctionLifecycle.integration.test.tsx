import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuctionDetail } from '../../src/pages/AuctionDetail';
import { SellerAuctions } from '../../src/pages/SellerAuctions';
import { ADAuctions } from '../../src/pages/ADAuctions';
import * as auctionApi from '../../src/api/auctions';
import * as auth from '../../src/context/AuthContext';
import type { Auction } from '../../src/types/auction';

vi.mock('../../src/api/auctions', () => ({
  loadAuction: vi.fn(), loadAuctionBids: vi.fn(), placeAuctionBid: vi.fn(),
  loadMyAuctions: vi.fn(),
  loadSellerAuctions: vi.fn(), submitSellerAuction: vi.fn(), cancelSellerAuction: vi.fn(),
  loadAdminAuctions: vi.fn(), reviewAuction: vi.fn(), cancelAuctionByAdmin: vi.fn(),
}));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../src/components/Sidebar', () => ({ default: ({ children }: { children?: ReactNode }) => <aside>{children}</aside> }));
vi.mock('../../src/components/ADsidebar', () => ({ ADsidebar: ({ children }: { children?: ReactNode }) => <aside>{children}</aside> }));

const liveAuction: Auction = {
  id: 4, title: 'Umbreon VMAX Alt Art', game: 'Pokemon', type: 'Single', imageUrl: null,
  description: 'Near mint', startingPrice: 1000, currentPrice: 1200, bidCount: 2,
  startsAt: '2026-11-01T10:00:00', endsAt: '2099-11-01T10:00:00', checkoutDeadline: null,
  status: 'LIVE', source: 'MARKETPLACE', storeId: 7, storeName: 'Moonlight TCG', sellerUserId: 9,
  winningUserId: null, leadingUserId: 44, reviewNote: null, createdAt: '2026-11-01T10:00:00',
};

const renderRoute = (element: ReactNode, entry: string) => render(
  <MemoryRouter initialEntries={[entry]}><Routes><Route path="/auctions/:id" element={element} /><Route path="*" element={element} /></Routes></MemoryRouter>,
);

describe('auction role workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.useAuth).mockReturnValue({
      user: { userId: 44, username: 'buyer', email: 'buyer@example.com', role: 'USER' },
      login: vi.fn(), logout: vi.fn(),
    });
    vi.mocked(auctionApi.loadAuction).mockResolvedValue(liveAuction);
    vi.mocked(auctionApi.loadMyAuctions).mockResolvedValue([]);
    vi.mocked(auctionApi.loadAuctionBids).mockResolvedValue([{ id: 1, amount: 1200, bidderCode: 'BU***44', createdAt: '2026-11-01T11:00:00' }]);
    vi.mocked(auctionApi.placeAuctionBid).mockResolvedValue({ id: 2, amount: 1300, bidderCode: 'BU***44', createdAt: '2026-11-01T12:00:00' });
  });

  it('shows the leading bidder state and reloads the auction after a valid raise', async () => {
    const user = userEvent.setup();
    renderRoute(<AuctionDetail />, '/auctions/4');

    expect(await screen.findByText('Umbreon VMAX Alt Art')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('currently the highest bidder');
    expect(screen.getByLabelText(/Your bid/i)).toHaveAttribute('min', '1250');
    await user.type(screen.getByLabelText(/Your bid/i), '1300');
    await user.click(screen.getByRole('button', { name: 'Raise your bid' }));

    await waitFor(() => expect(auctionApi.placeAuctionBid).toHaveBeenCalledWith(4, 1300));
    expect(auctionApi.loadAuction).toHaveBeenCalledTimes(2);
    expect(auctionApi.loadAuctionBids).toHaveBeenCalledTimes(2);
  });

  it('keeps a guest from submitting a bid while making the login path obvious', async () => {
    vi.mocked(auth.useAuth).mockReturnValue({ user: null, login: vi.fn(), logout: vi.fn() });
    renderRoute(<AuctionDetail />, '/auctions/4');
    expect(await screen.findByRole('button', { name: 'Log in to bid' })).toBeEnabled();
  });

  it('lets a seller submit a draft auction and refreshes the listing state', async () => {
    const user = userEvent.setup();
    vi.mocked(auctionApi.loadSellerAuctions)
      .mockResolvedValueOnce([{ ...liveAuction, status: 'DRAFT', currentPrice: 1000, bidCount: 0 }])
      .mockResolvedValueOnce([{ ...liveAuction, status: 'PENDING_REVIEW', currentPrice: 1000, bidCount: 0 }]);
    vi.mocked(auctionApi.submitSellerAuction).mockResolvedValue({ ...liveAuction, status: 'PENDING_REVIEW' });
    renderRoute(<SellerAuctions />, '/seller/auctions');

    expect(await screen.findByText('DRAFT')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Submit/i }));
    await waitFor(() => expect(auctionApi.submitSellerAuction).toHaveBeenCalledWith(4));
    expect(await screen.findByText('PENDING_REVIEW')).toBeInTheDocument();
  });

  it('lets an admin reject a pending auction with a required moderation note', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('prompt', vi.fn().mockReturnValue('Incorrect item condition'));
    vi.mocked(auctionApi.loadAdminAuctions).mockResolvedValue([{
      ...liveAuction, status: 'PENDING_REVIEW', currentPrice: 1000, bidCount: 0,
    }]);
    vi.mocked(auctionApi.reviewAuction).mockResolvedValue({ ...liveAuction, status: 'REJECTED', reviewNote: 'Incorrect item condition' });
    renderRoute(<ADAuctions />, '/admin/auctions');

    await screen.findByRole('button', { name: 'Reject' });
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(auctionApi.reviewAuction).toHaveBeenCalledWith(4, false, 'Incorrect item condition'));
  });
});

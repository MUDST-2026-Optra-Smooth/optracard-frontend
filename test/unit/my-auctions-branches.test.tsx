import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MyAuctions } from '../../src/pages/MyAuctions';
import * as auctionsApi from '../../src/api/auctions';

const auth = vi.hoisted(() => ({ user: { userId: 7, username: 'buyer', role: 'USER' } }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/api/auctions', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/auctions')>('../../src/api/auctions');
  return { ...actual, loadMyAuctions: vi.fn(), openAuctionDispute: vi.fn() };
});

const auction = (overrides: Record<string, unknown> = {}) => ({
  id: 1, title: 'Pikachu auction', status: 'LIVE', currentPrice: 100, bidCount: 2,
  leadingUserId: 7, winningUserId: null, checkoutDeadline: null, ...overrides,
});

describe('my auctions branches', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('renders loading, empty won view, leading and checkout states, and submits a dispute', async () => {
    const user = userEvent.setup();
    vi.mocked(auctionsApi.loadMyAuctions).mockResolvedValue([
      auction(), auction({ id: 2, title: 'Won auction', status: 'AWAITING_CHECKOUT', winningUserId: 7, checkoutDeadline: 'tomorrow' }),
      auction({ id: 3, title: 'Outbid auction', leadingUserId: 9 }),
    ] as never);
    vi.mocked(auctionsApi.openAuctionDispute).mockResolvedValue(undefined);
    render(<MemoryRouter><MyAuctions /></MemoryRouter>);
    expect(await screen.findByText('Pikachu auction')).toBeInTheDocument();
    expect(screen.getByText('You are leading')).toBeInTheDocument();
    expect(screen.getByText('You have been outbid')).toBeInTheDocument();
    await user.click(screen.getAllByText('Report a problem')[0]);
    await user.type(screen.getByLabelText('Dispute reason and evidence'), 'wrong card');
    await user.click(screen.getByRole('button', { name: 'Submit dispute' }));
    await waitFor(() => expect(auctionsApi.openAuctionDispute).toHaveBeenCalledWith(1, 'wrong card'));
    expect(screen.getByText('Dispute submitted for review.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Auctions I won' }));
    expect(screen.getByText('Won auction')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'All my bids' }));
  });

  it('shows API failures and disables blank dispute submissions', async () => {
    vi.mocked(auctionsApi.loadMyAuctions).mockRejectedValue(new Error('network down'));
    render(<MemoryRouter><MyAuctions /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('network down');
    cleanup();
    vi.mocked(auctionsApi.loadMyAuctions).mockResolvedValue([auction()] as never);
    render(<MemoryRouter><MyAuctions /></MemoryRouter>);
    await userEvent.setup().click(await screen.findByText('Report a problem'));
    expect(screen.getByRole('button', { name: 'Submit dispute' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Dispute reason and evidence'), { target: { value: 'x' } });
    vi.mocked(auctionsApi.openAuctionDispute).mockRejectedValue(new Error('cannot submit'));
    await userEvent.setup().click(screen.getByRole('button', { name: 'Submit dispute' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('cannot submit');
  });
});

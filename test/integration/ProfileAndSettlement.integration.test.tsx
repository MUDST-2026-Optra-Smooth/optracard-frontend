import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { EditProfile } from '../../src/pages/EditProfile';
import { SellerSettlements } from '../../src/pages/SellerSettlements';
import * as settlementApi from '../../src/api/settlements';
import * as auth from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../../src/api/settlements', () => ({ loadSellerSettlements: vi.fn() }));
vi.mock('../../src/components/Sidebar', () => ({ default: ({ children }: { children?: ReactNode }) => <aside>{children}</aside> }));

const report = {
  summary: { grossAmount: 1000, feeAmount: 50, netAmount: 950 },
  entries: [{ id: 1, referenceNumber: 'AUC-4', storeName: 'Moonlight TCG', sellerUserId: 7, storeId: 3, type: 'AUCTION_CHARGE', grossAmount: 1000, feeRate: 5, feeAmount: 50, netAmount: 950, status: 'POSTED', createdAt: '2026-11-01T10:00:00' }],
};

describe('profile persistence and seller settlement flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'existing-token');
    vi.mocked(auth.useAuth).mockReturnValue({
      user: { userId: 7, username: 'old-name', email: 'old@example.com', role: 'SELLER' }, login: vi.fn(), logout: vi.fn(),
    });
  });

  it('persists a refreshed profile image and token instead of logging the user out', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ username: 'old-name', email: 'old@example.com', phone: '', address: '', profileImage: 'data:image/png;base64,AAAA' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ profile: { username: 'new-name', email: 'new@example.com', profileImage: 'data:image/png;base64,BBBB' }, token: 'refreshed-token' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><EditProfile /></MemoryRouter>);

    await screen.findByDisplayValue('old-name');
    const [username, email] = screen.getAllByRole('textbox');
    await user.clear(username);
    await user.type(username, 'new-name');
    await user.clear(email);
    await user.type(email, 'new@example.com');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(auth.useAuth().login).toHaveBeenCalledWith(expect.objectContaining({ username: 'new-name', profileImage: 'data:image/png;base64,BBBB' }), 'refreshed-token'));
    expect(screen.getByRole('status')).toHaveTextContent('Profile and picture saved successfully.');
  });

  it('keeps a backend profile error visible instead of silently losing the edited session', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ username: 'old-name', email: 'old@example.com' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Image is too large' }), { status: 422 })));
    render(<MemoryRouter><EditProfile /></MemoryRouter>);
    await screen.findByDisplayValue('old-name');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText(/Image is too large/)).toBeInTheDocument();
  });

  it('applies seller settlement filters and renders an auction charge ledger entry', async () => {
    const user = userEvent.setup();
    vi.mocked(settlementApi.loadSellerSettlements).mockResolvedValue(report);
    render(<SellerSettlements />);
    expect(await screen.findByText('AUC-4')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Entry type'), 'AUCTION_CHARGE');
    await user.click(screen.getByRole('button', { name: /Apply filters/i }));
    await waitFor(() => expect(settlementApi.loadSellerSettlements).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'AUCTION_CHARGE' })));
    expect(screen.getByText('AUCTION CHARGE')).toBeInTheDocument();
  });
});

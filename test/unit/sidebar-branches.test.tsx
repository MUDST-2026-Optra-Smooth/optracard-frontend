import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../../src/components/Sidebar';
import * as sellerApi from '../../src/api/seller';

const auth = vi.hoisted(() => ({ user: { userId: 7, username: 'fallback-shop', email: 'seller@test', role: 'SELLER' }, logout: vi.fn() }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/api/seller', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/seller')>('../../src/api/seller');
  return { ...actual, loadMyStore: vi.fn() };
});
vi.mock('../../src/components/AdminHeader', () => ({ AdminHeader: ({ workspaceName }: { workspaceName: string }) => <header>{workspaceName}</header> }));

describe('seller sidebar store status branches', () => {
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('renders approved store status and all seller navigation links', async () => {
    vi.mocked(sellerApi.loadMyStore).mockResolvedValue({ storeId: 4, storeName: 'Approved Cards', storeStatus: 'APPROVED' } as never);
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Approved Cards')).toBeInTheDocument());
    expect(screen.getByText('APPROVED')).toBeInTheDocument();
    expect(screen.getByText('Earnings & Settlements')).toBeInTheDocument();
    expect(screen.getByText('Auction Listings')).toBeInTheDocument();
  });

  it('renders pending status and falls back to username when store loading fails', async () => {
    vi.mocked(sellerApi.loadMyStore).mockResolvedValue({ storeId: 5, storeName: 'Pending Cards', storeStatus: 'PENDING' } as never);
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pending Cards')).toBeInTheDocument());
    expect(screen.getByText('PENDING')).toBeInTheDocument();

    cleanup();
    vi.mocked(sellerApi.loadMyStore).mockRejectedValue(new Error('offline'));
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText('Seller · fallback-shop')).toBeInTheDocument();
    await waitFor(() => expect(sellerApi.loadMyStore).toHaveBeenCalled());
  });
});

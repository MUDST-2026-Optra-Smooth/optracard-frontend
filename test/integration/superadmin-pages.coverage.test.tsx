import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SPAD_AddAdmin } from '../../src/pages/SPAD_AddAdmin';
import { SPAD_Catalog } from '../../src/pages/SPAD_Catalog';
import { SPAD_Stores } from '../../src/pages/SPAD_Stores';
import { SPAD_StoreDetail } from '../../src/pages/SPAD_StoreDetail';
import { SPAD_Transactions } from '../../src/pages/SPAD_Transactions';
import { SPAD_Staff } from '../../src/pages/SPAD_Staff';
import { SPAD_MarketplaceFee } from '../../src/pages/SPAD_MarketplaceFee';
import * as superadminApi from '../../src/api/superadmin';
import * as settlementApi from '../../src/api/settlements';

vi.mock('../../src/components/SPAD_Shell', () => ({ SPAD_Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => ({ user: { userId: 99, role: 'SUPER_ADMIN' }, logout: vi.fn() }) }));
  vi.mock('../../src/api/superadmin', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/superadmin')>('../../src/api/superadmin');
  return { ...actual, loadSuperAdminCatalog: vi.fn(), loadSuperAdminStores: vi.fn(), loadSuperAdminStore: vi.fn(), loadSuperAdminTransactions: vi.fn(), loadSuperAdminStaff: vi.fn(), createSuperAdminStaff: vi.fn(), deleteSuperAdminStaff: vi.fn(), loadSuperAdminOverview: vi.fn(), loadSuperAdminUsers: vi.fn(), deleteSuperAdminUser: vi.fn() };
});
vi.mock('../../src/api/settlements', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/settlements')>('../../src/api/settlements');
  return { ...actual, loadMarketplaceFeeConfig: vi.fn(), loadMarketplaceFeeHistory: vi.fn(), loadSuperAdminSettlements: vi.fn(), updateMarketplaceFeeConfig: vi.fn() };
});

const catalogProduct = { id: 1, name: 'Pikachu', game: 'Pokemon', type: 'Single', storeName: 'Official Store', listingSource: 'OFFICIAL', price: 100, stock: 4, active: true, approvalStatus: 'APPROVED', imageUrl: null } as never;
const store = { storeId: 7, storeName: 'Card Corner', storeSlug: 'card-corner', ownerName: 'Seller', ownerEmail: 'seller@test', ownerPhone: null, location: 'Bangkok', storeStatus: 'APPROVED', submittedAt: '2026-01-01', reviewedAt: '2026-01-02', productCount: 1, activeProductCount: 1, totalStock: 3, gmv: 500, orderCount: 2, description: null, products: [catalogProduct] } as never;
const transaction = { id: 1, orderNumber: 'ORD-1', buyerName: 'Buyer', storeName: 'Official Store', source: 'OFFICIAL', itemCount: 1, total: 100, createdAt: '2026-01-01', paymentStatus: 'PAID', status: 'Processing', shippingMethod: 'Standard' } as never;
const staff = { id: 5, username: 'admin', email: 'admin@test', role: 'ADMIN', phone: null, createdAt: '2026-01-01' } as never;
const feeReport = { entries: [], summary: { grossAmount: 0, feeAmount: 0, netAmount: 0 } } as never;

describe('superadmin management pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(superadminApi.loadSuperAdminCatalog).mockResolvedValue([catalogProduct]);
    vi.mocked(superadminApi.loadSuperAdminStores).mockResolvedValue([store]);
    vi.mocked(superadminApi.loadSuperAdminStore).mockResolvedValue(store);
    vi.mocked(superadminApi.loadSuperAdminTransactions).mockResolvedValue([transaction]);
    vi.mocked(superadminApi.loadSuperAdminStaff).mockResolvedValue([staff]);
    vi.mocked(settlementApi.loadMarketplaceFeeConfig).mockResolvedValue({ id: 1, feeRate: 5, effectiveFrom: '2026-01-01', changedBy: 'admin' } as never);
    vi.mocked(settlementApi.loadMarketplaceFeeHistory).mockResolvedValue([]);
    vi.mocked(settlementApi.loadSuperAdminSettlements).mockResolvedValue(feeReport);
  });
  afterEach(() => cleanup());

  it('loads catalog, stores, store detail and transactions', async () => {
    render(<MemoryRouter><SPAD_Catalog /></MemoryRouter>);
    expect(await screen.findByText('Pikachu')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><SPAD_Stores /></MemoryRouter>);
    expect(await screen.findByText('Card Corner')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter initialEntries={['/superadmin/stores/7']}><Routes><Route path="/superadmin/stores/:storeId" element={<SPAD_StoreDetail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Store contact')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><SPAD_Transactions /></MemoryRouter>);
    expect(await screen.findByText('ORD-1')).toBeInTheDocument();
  });

  it('loads staff and fee configuration forms', async () => {
    render(<MemoryRouter><SPAD_Staff /></MemoryRouter>);
    expect(await screen.findByText('Manage Staff')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><SPAD_MarketplaceFee /></MemoryRouter>);
    expect(await screen.findByText('Marketplace Fee & Settlement')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><SPAD_AddAdmin /></MemoryRouter>);
    expect(screen.getByText('Add administrator')).toBeInTheDocument();
  });

  it('shows recoverable errors for superadmin pages', async () => {
    vi.mocked(superadminApi.loadSuperAdminCatalog).mockRejectedValue(new Error('catalog unavailable'));
    render(<MemoryRouter><SPAD_Catalog /></MemoryRouter>);
    expect(await screen.findByText('catalog unavailable')).toBeInTheDocument();
    cleanup();
    vi.mocked(settlementApi.loadMarketplaceFeeConfig).mockRejectedValue(new Error('fee unavailable'));
    render(<MemoryRouter><SPAD_MarketplaceFee /></MemoryRouter>);
    expect(await screen.findByText('fee unavailable')).toBeInTheDocument();
  });

  it('updates marketplace fee, filters ledger, and handles validation/API errors', async () => {
    vi.mocked(settlementApi.loadMarketplaceFeeConfig).mockResolvedValue({ id: 1, feeRate: 5, effectiveFrom: '2026-01-01', changedBy: 'admin' } as never);
    vi.mocked(settlementApi.loadMarketplaceFeeHistory).mockResolvedValue([{ id: 1, feeRate: 4, effectiveFrom: '2025-01-01', changedBy: 'old-admin' }] as never);
    vi.mocked(settlementApi.loadSuperAdminSettlements).mockResolvedValue({ entries: [{ id: 7, referenceNumber: 'ORD-7', storeName: 'Card Corner', sellerUserId: 3, storeId: 9, type: 'ORDER_CHARGE', grossAmount: 100, feeRate: 5, feeAmount: 5, netAmount: 95, status: 'POSTED', createdAt: '2026-01-01' }], summary: { grossAmount: 100, feeAmount: 5, netAmount: 95 } } as never);
    vi.mocked(settlementApi.updateMarketplaceFeeConfig).mockResolvedValue({ id: 2, feeRate: 7, effectiveFrom: '2026-01-02', changedBy: 'admin' } as never);
    render(<MemoryRouter><SPAD_MarketplaceFee /></MemoryRouter>);
    expect(await screen.findByText('ORD-7')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '7' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update fee rate' }));
    await waitFor(() => expect(settlementApi.updateMarketplaceFeeConfig).toHaveBeenCalledWith(7));
    expect(await screen.findByRole('status')).toHaveTextContent(/updated/i);
    fireEvent.change(screen.getByDisplayValue('5'), { target: { value: '101' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update fee rate' }));
    expect(await screen.findByText(/0 to 100/i)).toBeInTheDocument();
    vi.mocked(settlementApi.updateMarketplaceFeeConfig).mockRejectedValueOnce(new Error('save failed'));
    fireEvent.change(screen.getByDisplayValue('101'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update fee rate' }));
    expect(await screen.findByText('save failed')).toBeInTheDocument();
  });

  it('renders empty fee history and applies settlement filters', async () => {
    vi.mocked(settlementApi.loadMarketplaceFeeHistory).mockResolvedValue([]);
    vi.mocked(settlementApi.loadSuperAdminSettlements).mockResolvedValue({ entries: [], summary: { grossAmount: 0, feeAmount: 0, netAmount: 0 } } as never);
    render(<MemoryRouter><SPAD_MarketplaceFee /></MemoryRouter>);
    expect(await screen.findByText('No fee-rate history found.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-01-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2026-01-31' } });
    fireEvent.change(screen.getByLabelText('Entry type'), { target: { value: 'AUCTION_CHARGE' } });
    fireEvent.change(screen.getByLabelText('Seller user ID'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Store ID'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    await waitFor(() => expect(settlementApi.loadSuperAdminSettlements).toHaveBeenCalledWith(expect.objectContaining({ type: 'AUCTION_CHARGE', sellerUserId: 3, storeId: 9 })));
  });
});

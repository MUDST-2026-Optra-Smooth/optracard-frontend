/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sellerApi, stockApi, auctionApi, adminApi } = vi.hoisted(() => ({
  sellerApi: { loadMyStore: vi.fn(), loadSellerProducts: vi.fn(), deleteSellerProduct: vi.fn() },
  stockApi: { loadStockAlerts: vi.fn(), loadStockAlertSettings: vi.fn(), updateStockAlertSettings: vi.fn() },
  auctionApi: { loadSellerAuctions: vi.fn(), submitSellerAuction: vi.fn(), cancelSellerAuction: vi.fn() },
  adminApi: { loadAdminOrders: vi.fn() },
}));
vi.mock('../../src/api/seller', () => sellerApi);
vi.mock('../../src/api/stockAlerts', () => stockApi);
vi.mock('../../src/api/auctions', () => auctionApi);
vi.mock('../../src/api/admin', () => adminApi);
vi.mock('../../src/components/Sidebar', async () => {
  const actual = await vi.importActual<typeof import('../../src/components/Sidebar')>('../../src/components/Sidebar');
  return { ...actual, default: () => <aside>seller sidebar</aside> };
});
vi.mock('../../src/components/ADsidebar', () => ({ default: () => <aside>admin sidebar</aside>, ADsidebar: () => <aside>admin sidebar</aside> }));
vi.mock('../../src/components/AdminWorkspace', async () => {
  const actual = await vi.importActual<typeof import('../../src/components/AdminWorkspace')>('../../src/components/AdminWorkspace');
  return { ...actual, AdminWorkspace: ({ children }: { children: React.ReactNode }) => <div>{children}</div> };
});
import Seller from '../../src/pages/seller';
import { SellerAuctions } from '../../src/pages/SellerAuctions';
import ADordersManagement from '../../src/pages/AD_ordersManagement';

const product = (overrides: Partial<any> = {}) => ({ id: 1, name: 'Pikachu', game: 'Pokemon', type: 'Single', cost: 10, price: 20, stock: 2, imageUrl: null, productSet: null, language: null, description: null, approvalStatus: 'APPROVED', active: true, storeId: 1, storeName: 'Shop', ...overrides });
const auction = (overrides: Partial<any> = {}) => ({ id: 1, title: 'Auction card', game: 'Pokemon', type: 'Single', imageUrl: null, description: null, startingPrice: 100, currentPrice: 110, bidCount: 0, startsAt: '2026-01-01T00:00:00Z', endsAt: '2026-01-02T00:00:00Z', checkoutDeadline: null, status: 'DRAFT', source: 'MARKETPLACE', storeId: 1, storeName: 'Shop', sellerUserId: 1, winningUserId: null, leadingUserId: null, reviewNote: null, createdAt: '2026-01-01T00:00:00Z', ...overrides });
const order = (overrides: Partial<any> = {}) => ({ id: 1, orderNumber: 'ORD-1', buyerId: 2, buyerName: 'Buyer', createdAt: '2026-01-01T00:00:00Z', total: 100, source: 'OFFICIAL', storeId: null, storeName: null, status: 'PROCESSING', paymentStatus: 'PAID', paymentMethod: 'CARD', shippingMethod: 'STANDARD', shippingAddress: null, recipientName: null, recipientPhone: null, trackingNumber: null, items: [], ...overrides });

describe('seller inventory and auction controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sellerApi.loadMyStore.mockResolvedValue({ storeId: 1, storeName: 'Demo Shop' });
    sellerApi.loadSellerProducts.mockResolvedValue([product(), product({ id: 2, name: 'Mew', approvalStatus: 'PENDING', active: false, stock: 0, imageUrl: 'mew.jpg', game: 'Magic' })]);
    sellerApi.deleteSellerProduct.mockResolvedValue(undefined);
    stockApi.loadStockAlerts.mockResolvedValue([{ id: 1, productId: 2, productName: 'Mew', storeName: 'Demo', stock: 0, threshold: 5, alertType: 'OUT_OF_STOCK', read: false, activatedAt: null, listingSource: 'MARKETPLACE' }]);
    stockApi.loadStockAlertSettings.mockResolvedValue({ defaultThreshold: 5 });
    stockApi.updateStockAlertSettings.mockResolvedValue({ defaultThreshold: 8 });
    auctionApi.loadSellerAuctions.mockResolvedValue([auction(), auction({ id: 2, status: 'LIVE', bidCount: 0 }), auction({ id: 3, status: 'REJECTED', reviewNote: 'Fix image' })]);
    auctionApi.submitSellerAuction.mockResolvedValue(undefined);
    auctionApi.cancelSellerAuction.mockResolvedValue(undefined);
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('loads products, filters, saves threshold, edits and deletes', async () => {
    const user = userEvent.setup();
    cleanup();
    render(<MemoryRouter><Seller /></MemoryRouter>);
    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Search product name/), 'Mew');
    expect(screen.getByText('Mew')).toBeInTheDocument();
    await user.selectOptions(screen.getByDisplayValue('All Approval Statuses'), 'PENDING');
    await user.selectOptions(screen.getByDisplayValue('All Visibility States'), 'INACTIVE');
    await user.clear(screen.getByLabelText('Store threshold'));
    await user.type(screen.getByLabelText('Store threshold'), '8');
    await user.click(screen.getByRole('button', { name: 'Save threshold' }));
    await waitFor(() => expect(stockApi.updateStockAlertSettings).toHaveBeenCalledWith(8));
    await user.click(screen.getByRole('button', { name: 'Edit Mew' }));
    await user.click(screen.getByRole('button', { name: /Delete Mew/ }));
    await waitFor(() => expect(sellerApi.deleteSellerProduct).toHaveBeenCalledWith(2));
  });

  it('shows validation and API errors', async () => {
    const user = userEvent.setup();
    stockApi.loadStockAlertSettings.mockRejectedValue(new Error('settings down'));
    sellerApi.loadSellerProducts.mockRejectedValue(new Error('inventory down'));
    render(<MemoryRouter><Seller /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('inventory down');
    stockApi.loadStockAlertSettings.mockResolvedValue({ defaultThreshold: 5 });
    sellerApi.loadSellerProducts.mockResolvedValue([product()]);
    cleanup();
    render(<MemoryRouter><Seller /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Pikachu')).toBeInTheDocument());
    const threshold = screen.getAllByLabelText('Store threshold')[0];
    await user.clear(threshold);
    await user.type(threshold, '0');
    await user.click(screen.getByRole('button', { name: 'Save threshold' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/between 1 and 100,000/);
  });

  it('loads auction listings and exercises submit, edit and cancel paths', async () => {
    const user = userEvent.setup();
    cleanup();
    render(<MemoryRouter><SellerAuctions /></MemoryRouter>);
    expect((await screen.findAllByText('Auction card')).length).toBe(3);
    await user.click(screen.getAllByRole('button', { name: /Submit/ })[0]);
    await waitFor(() => expect(auctionApi.submitSellerAuction).toHaveBeenCalledWith(1));
    await user.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    await user.click(screen.getAllByRole('button', { name: /Cancel/ })[0]);
    await waitFor(() => expect(auctionApi.cancelSellerAuction).toHaveBeenCalled());
    auctionApi.loadSellerAuctions.mockRejectedValue(new Error('auctions down'));
    cleanup();
    render(<MemoryRouter><SellerAuctions /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('auctions down');
  });
});

describe('admin orders management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminApi.loadAdminOrders.mockResolvedValue([order(), order({ id: 2, orderNumber: 'ORD-2', source: 'MARKETPLACE', storeName: 'Seller', status: 'SHIPPED' })]);
  });
  it('defaults to official, switches source/status, searches and opens details', async () => {
    const user = userEvent.setup();
    cleanup();
    render(<MemoryRouter><ADordersManagement /></MemoryRouter>);
    expect(await screen.findByText('ORD-1')).toBeInTheDocument();
    expect(adminApi.loadAdminOrders).toHaveBeenCalledWith('OFFICIAL');
    await user.click(screen.getByRole('button', { name: 'Marketplace' }));
    await waitFor(() => expect(adminApi.loadAdminOrders).toHaveBeenCalledWith('MARKETPLACE'));
    await user.selectOptions(screen.getByDisplayValue('All statuses'), 'SHIPPED');
    await user.type(screen.getByPlaceholderText(/Search order/), 'Seller');
    expect(screen.getByText('ORD-2')).toBeInTheDocument();
    await user.click(screen.getByText('ORD-2'));
  });
  it('renders error and empty states', async () => {
    adminApi.loadAdminOrders.mockRejectedValue(new Error('orders down'));
    cleanup();
    render(<MemoryRouter><ADordersManagement /></MemoryRouter>);
    expect(await screen.findByText('orders down')).toBeInTheDocument();
    adminApi.loadAdminOrders.mockResolvedValue([]);
    cleanup();
    render(<MemoryRouter><ADordersManagement /></MemoryRouter>);
    expect(await screen.findByText(/No orders found/)).toBeInTheDocument();
  });
});

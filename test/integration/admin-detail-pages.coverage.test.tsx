/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const admin = vi.hoisted(() => ({
  loadAdminStores: vi.fn(), loadAdminStore: vi.fn(), loadAdminMarketplaceProducts: vi.fn(),
  loadAdminProduct: vi.fn(), loadAdminMarketplaceProduct: vi.fn(), deleteAdminProduct: vi.fn(), updateAdminProduct: vi.fn(),
  updateAdminProductActive: vi.fn(), loadAdminCardGames: vi.fn(), createAdminProduct: vi.fn(),
  loadAdminOrders: vi.fn(), loadAdminOrder: vi.fn(), updateAdminOrderStatus: vi.fn(), loadAdminDashboard: vi.fn(),
  reviewAdminStore: vi.fn(), approveMarketplaceRequest: vi.fn(), rejectMarketplaceRequest: vi.fn(),
}));
const catalog = vi.hoisted(() => ({ searchCatalog: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../../src/api/admin', () => admin);
vi.mock('../../src/api/catalog', () => catalog);
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('../../src/components/AdminWorkspace', () => ({
  AdminWorkspace: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
  AdminError: ({ message, onRetry }: { message: string; onRetry?: () => void }) => <div role="alert"><span>{message}</span>{onRetry && <button onClick={onRetry}>Retry</button>}</div>,
  AdminLoading: ({ label }: { label: string }) => <div>{label}</div>,
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
  formatCurrency: (value: number) => `฿${value}`,
  formatDate: (value?: string | null) => value ?? '—',
}));
vi.mock('../../src/components/AdminProductForm', () => ({
  emptyAdminProduct: {},
  AdminProductForm: ({ onSubmit, onCancel }: { onSubmit: (value: any) => Promise<void>; onCancel: () => void }) => (
    <div><button onClick={() => void onSubmit({ name: 'Updated', game: 'Pokemon', type: 'Single', cost: 1, price: 2, stock: 3, imageUrl: null, productSet: null, language: null, description: null })}>Save changes to database</button><button onClick={onCancel}>Cancel</button></div>
  ),
}));

import { AD_MarketplaceProducts } from '../../src/pages/AD_MarketplaceProducts';
import { AD_MarketplaceStorelist } from '../../src/pages/AD_MarketplaceStorelist';
import { ADstoreRequest } from '../../src/pages/AD_storeRequest';
import { ADpddetail } from '../../src/pages/AD_pddetail';
import { ADeditProduct } from '../../src/pages/AD_editProduct';
import { ADaddProduct } from '../../src/pages/AD_addProduct';
import { ADordersManagement } from '../../src/pages/AD_ordersManagement';
import { ADorderDetail } from '../../src/pages/AD_orderDetail';
import { AD_MarketplaceRequestsList } from '../../src/pages/AD_MarketplacelistRequests';
import { AD_MarketplaceProductDetail } from '../../src/pages/AD_MarketplaceProductsdetail';
import { AD_MarketplaceRequestDetail } from '../../src/pages/AD_MarketplaceRequests';
import { ADstoreRequestdetail } from '../../src/pages/AD_storeRequestdetail';
import { ADdashboard } from '../../src/pages/AD_dashboard';

const store = { storeId: 7, storeName: 'Card Corner', ownerName: 'Seller', ownerEmail: 'seller@test', storeStatus: 'APPROVED', productCount: 1, active: true, physicalStore: false, storeProfileImage: null, district: 'Bangkok', province: 'Bangkok', submittedAt: '2026-01-01' } as any;
const product = { id: 11, name: 'Gengar VMAX', game: 'Pokemon', type: 'Single', cost: 10, price: 20, stock: 4, active: true, imageUrl: null, productSet: 'Set', language: 'EN', description: 'Rare' } as any;
const order = { id: 5, orderNumber: 'ORD-5', buyerId: 2, buyerName: 'Buyer', storeName: 'Official Store', source: 'OFFICIAL', status: 'Processing', paymentStatus: 'PAID', paymentMethod: 'credit-card', shippingMethod: 'Standard', trackingNumber: null, createdAt: '2026-01-01', recipientName: 'Buyer', recipientPhone: '0800000000', shippingAddress: 'Bangkok', items: [{ productId: 11, name: 'Gengar VMAX', game: 'Pokemon', price: 20, quantity: 1 }], subtotal: 20, discountAmount: 0, shippingFee: 0, total: 20 } as any;

const router = (element: React.ReactNode, path: string, entry: string) => render(<MemoryRouter initialEntries={[entry]}><Routes><Route path={path} element={element} /></Routes></MemoryRouter>);

describe('admin detail and creation pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    admin.loadAdminStores.mockResolvedValue([store]);
    admin.loadAdminStore.mockResolvedValue(store);
    admin.loadAdminMarketplaceProducts.mockResolvedValue([product]);
    admin.loadAdminProduct.mockResolvedValue(product);
    admin.loadAdminMarketplaceProduct.mockResolvedValue(product);
    admin.loadAdminCardGames.mockResolvedValue([{ id: 1, name: 'Pokemon' }]);
    admin.deleteAdminProduct.mockResolvedValue(undefined);
    admin.updateAdminProduct.mockResolvedValue(undefined);
    admin.updateAdminProductActive.mockImplementation(async (_id: number, active: boolean) => ({ ...product, active }));
    admin.createAdminProduct.mockResolvedValue({ id: 20 });
    admin.loadAdminOrders.mockResolvedValue([order]);
    admin.loadAdminDashboard.mockResolvedValue({ totalRevenue: 100, totalExpenses: 50, totalProfit: 50, totalOrders: 2, totalItems: 3, averageOrderValue: 50, activeOfficialProducts: 4, activeMarketplaceProducts: 2, pendingStoreVerifications: 1, pendingMarketplaceRequests: 1, lowStockProducts: 1, monthlyMetrics: [{ month: 'Jan', revenue: 100, expenses: 50 }], recentOrders: [order] });
    admin.loadAdminOrder.mockResolvedValue(order);
    admin.updateAdminOrderStatus.mockImplementation(async (_id: number, status: string, tracking: string) => ({ ...order, status: status === 'SHIPPED' ? 'Shipped' : status, trackingNumber: tracking }));
    admin.approveMarketplaceRequest.mockResolvedValue(undefined);
    admin.rejectMarketplaceRequest.mockResolvedValue(undefined);
    admin.reviewAdminStore.mockResolvedValue(undefined);
    catalog.searchCatalog.mockResolvedValue([{ ...product, source: 'MARKETPLACE', store }]);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('loads and filters approved marketplace stores and inventory', async () => {
    router(<AD_MarketplaceProducts />, '/admin/marketplace/products', '/admin/marketplace/products');
    expect(await screen.findByText('Card Corner')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Search marketplace store/i), { target: { value: 'missing' } });
    expect(screen.getByText(/No approved marketplace stores/i)).toBeInTheDocument();
    cleanup();
    router(<AD_MarketplaceStorelist />, '/admin/marketplace/stores/:storeId', '/admin/marketplace/stores/7');
    expect(await screen.findByText('Gengar VMAX')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Search this store/i), { target: { value: 'none' } });
    expect(screen.getByText(/No marketplace listings/i)).toBeInTheDocument();
  });

  it('loads store requests, filters, changes status and handles errors', async () => {
    router(<ADstoreRequest />, '/admin/store-requests', '/admin/store-requests');
    expect(await screen.findByText('Card Corner')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Search store/i), { target: { value: 'seller@test' } });
    expect(screen.getByText('Seller')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'PENDING' } });
    await waitFor(() => expect(admin.loadAdminStores).toHaveBeenLastCalledWith('PENDING'));
    admin.loadAdminStores.mockRejectedValueOnce(new Error('stores offline'));
    fireEvent.click(screen.getByRole('button', { name: /Refresh/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('stores offline');
  });

  it('shows product detail and supports edit/delete actions', async () => {
    router(<ADpddetail />, '/admin/products/:id', '/admin/products/11');
    expect(await screen.findByText('Gengar VMAX')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Edit product/i }));
    expect(navigate).toHaveBeenCalledWith('/admin/products/11/edit');
    fireEvent.click(screen.getByRole('button', { name: /Delete permanently/i }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/admin/stocks', { replace: true }));
    cleanup();
    admin.loadAdminProduct.mockRejectedValueOnce(new Error('product offline'));
    router(<ADpddetail />, '/admin/products/:id', '/admin/products/11');
    expect(await screen.findByRole('alert')).toHaveTextContent('product offline');
  });

  it('edits product visibility and submits product form', async () => {
    router(<ADeditProduct />, '/admin/products/:id/edit', '/admin/products/11/edit');
    expect(await screen.findByText('Edit product')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Set inactive/i }));
    await waitFor(() => expect(admin.updateAdminProductActive).toHaveBeenCalledWith(11, false));
    fireEvent.click(screen.getByRole('button', { name: /Save changes/i }));
    await waitFor(() => expect(admin.updateAdminProduct).toHaveBeenCalled());
  });

  it('creates an official product from a catalog template and handles API errors', async () => {
    router(<ADaddProduct />, '/admin/products/new', '/admin/products/new');
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());
    const name = screen.getByPlaceholderText(/One Piece PRB/i);
    fireEvent.change(name, { target: { value: 'Gengar' } });
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(screen.getByText('Existing catalog products')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Pokemon' } });
    fireEvent.submit(screen.getByRole('button', { name: /Create Official Product/i }).closest('form')!);
    await waitFor(() => expect(admin.createAdminProduct).toHaveBeenCalled());
  });

  it('filters admin orders by source/status and opens detail', async () => {
    router(<ADordersManagement />, '/admin/orders', '/admin/orders');
    expect(await screen.findByText('ORD-5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Marketplace' }));
    await waitFor(() => expect(admin.loadAdminOrders).toHaveBeenLastCalledWith('MARKETPLACE'));
    fireEvent.change(screen.getByPlaceholderText(/Search order number/i), { target: { value: 'missing' } });
    expect(screen.getByText(/No orders found/i)).toBeInTheDocument();
  });

  it('updates official order status and leaves marketplace fulfillment read-only', async () => {
    router(<ADorderDetail />, '/admin/orders/:orderId', '/admin/orders/5');
    expect(await screen.findByText('ORD-5')).toBeInTheDocument();
    const tracking = screen.getByPlaceholderText('e.g. TH123456789');
    fireEvent.change(tracking, { target: { value: 'TRACK-1' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Update status in database/i }), { target: { value: 'PROCESSING' } });
    await waitFor(() => expect(admin.updateAdminOrderStatus).toHaveBeenCalledWith(5, 'PROCESSING', 'TRACK-1'));
    cleanup();
    admin.loadAdminOrder.mockResolvedValueOnce({ ...order, source: 'MARKETPLACE', storeName: 'Card Corner' });
    router(<ADorderDetail />, '/admin/orders/:orderId', '/admin/orders/5');
    expect(await screen.findByText(/fulfillment is managed by the seller/i)).toBeInTheDocument();
  });

  it('reviews marketplace listings and handles rejected and approved actions', async () => {
    admin.loadAdminMarketplaceProducts.mockResolvedValueOnce([{ ...product, approvalStatus: 'PENDING', storeName: 'Card Corner' }]).mockResolvedValue([]);
    router(<AD_MarketplaceRequestsList />, '/admin/marketplace/requests', '/admin/marketplace/requests');
    expect(await screen.findByText('Gengar VMAX')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(admin.approveMarketplaceRequest).toHaveBeenCalledWith(11));
    expect(await screen.findByText(/No marketplace listings found/i)).toBeInTheDocument();
  });

  it('reviews marketplace product detail with approve, reload and navigation', async () => {
    admin.loadAdminMarketplaceProduct.mockResolvedValue({ ...product, approvalStatus: 'PENDING', storeId: 7, storeName: 'Card Corner' });
    router(<AD_MarketplaceProductDetail />, '/admin/marketplace/products/:productId', '/admin/marketplace/products/11');
    expect(await screen.findByText('Gengar VMAX')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(admin.approveMarketplaceRequest).toHaveBeenCalledWith(11));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('reviews marketplace request detail with rejection note and handles load errors', async () => {
    admin.loadAdminMarketplaceProduct.mockResolvedValue({ ...product, approvalStatus: 'PENDING', storeId: 7, storeName: 'Card Corner' });
    router(<AD_MarketplaceRequestDetail />, '/admin/marketplace/requests/:id', '/admin/marketplace/requests/11');
    expect(await screen.findByText('Gengar VMAX')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByPlaceholderText(/feedback for the seller/i), { target: { value: 'Missing evidence' } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Reject' }));
    await waitFor(() => expect(admin.rejectMarketplaceRequest).toHaveBeenCalledWith(11, 'Missing evidence'));
    admin.loadAdminMarketplaceProduct.mockRejectedValueOnce(new Error('request failed'));
    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('request failed');
  });

  it('loads the admin store verification detail and reviews an application', async () => {
    const pendingStore = { ...store, storeStatus: 'PENDING', reviewNote: '', storeDescription: 'A shop', ownerPhone: '0800', storeAddress: 'Bangkok', storeSlug: 'card-corner' };
    admin.loadAdminStore.mockResolvedValue(pendingStore);
    router(<ADstoreRequestdetail />, '/admin/store-requests/:id', '/admin/store-requests/7');
    expect(await screen.findByText('Card Corner')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/Optional review message/i), { target: { value: 'Looks good' } });
    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    await waitFor(() => expect(admin.reviewAdminStore).toHaveBeenCalledWith(7, 'APPROVED', 'Looks good'));
  });

  it('renders dashboard metrics, refreshes, and reports errors', async () => {
    router(<ADdashboard />, '/admin', '/admin');
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    await waitFor(() => expect(admin.loadAdminDashboard).toHaveBeenCalledTimes(2));
    admin.loadAdminDashboard.mockRejectedValueOnce(new Error('dashboard unavailable'));
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('dashboard unavailable');
  });
});

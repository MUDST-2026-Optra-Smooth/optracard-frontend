import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Seller } from '../../src/pages/seller';
import { Dashboard } from '../../src/pages/Dashboard';
import { OrdersManagement } from '../../src/pages/OrdersManagement';
import { ADdashboard } from '../../src/pages/AD_dashboard';
import { ADstocks } from '../../src/pages/AD_stocksManagement';
import { AD_MarketplaceProducts } from '../../src/pages/AD_MarketplaceProducts';
import { SPAD_Overview } from '../../src/pages/SPAD_Overview';
import { SPAD_Users } from '../../src/pages/SPAD_Users';
import * as sellerApi from '../../src/api/seller';
import * as stockApi from '../../src/api/stockAlerts';
import * as adminApi from '../../src/api/admin';
import * as superadminApi from '../../src/api/superadmin';

const navigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('../../src/components/Sidebar', () => ({ default: () => <aside>Seller navigation</aside> }));
vi.mock('../../src/components/AdminWorkspace', () => ({
  AdminWorkspace: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AdminError: ({ message }: { message: string }) => <div role="alert">{message}</div>,
  AdminLoading: ({ label }: { label: string }) => <div>{label}</div>,
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
  formatCurrency: (value: number) => `฿${value}`,
  formatDate: (value: string) => value,
}));
vi.mock('../../src/components/SPAD_Shell', () => ({ SPAD_Shell: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('../../src/components/dashboard/RevenueBarChart', () => ({ RevenueBarChart: () => <div>Revenue chart</div> }));
vi.mock('../../src/components/dashboard/SalesTrendLineChart', () => ({ SalesTrendLineChart: () => <div>Sales trend</div> }));
vi.mock('../../src/components/dashboard/OrderStatusDonutChart', () => ({ OrderStatusDonutChart: () => <div>Order chart</div> }));
vi.mock('../../src/components/dashboard/StockDistributionChart', () => ({ StockDistributionChart: () => <div>Stock chart</div> }));

vi.mock('../../src/api/seller', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/seller')>('../../src/api/seller');
  return { ...actual, loadMyStore: vi.fn(), loadSellerProducts: vi.fn(), loadSellerOrders: vi.fn(), deleteSellerProduct: vi.fn(), updateSellerOrderStatus: vi.fn() };
});
vi.mock('../../src/api/stockAlerts', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/stockAlerts')>('../../src/api/stockAlerts');
  return { ...actual, loadStockAlerts: vi.fn(), loadStockAlertSettings: vi.fn(), updateStockAlertSettings: vi.fn() };
});
vi.mock('../../src/api/admin', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/admin')>('../../src/api/admin');
  return { ...actual, loadAdminDashboard: vi.fn(), loadAdminProducts: vi.fn(), loadAdminStores: vi.fn(), loadStockAlertSettings: vi.fn(), updateStockAlertSettings: vi.fn(), deleteAdminProduct: vi.fn() };
});
vi.mock('../../src/api/superadmin', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/superadmin')>('../../src/api/superadmin');
  return { ...actual, loadSuperAdminOverview: vi.fn(), loadSuperAdminUsers: vi.fn(), deleteSuperAdminUser: vi.fn() };
});

const store = { storeId: 7, storeName: 'AAA Trading', storeStatus: 'APPROVED', ownerName: 'Seller', ownerEmail: 'seller@test', productCount: 2 } as never;
const sellerProduct = { id: 1, name: 'Pikachu', game: 'Pokemon', type: 'Single', stock: 2, price: 100, costPrice: 50, active: true, approvalStatus: 'APPROVED', imageUrl: null, description: '' } as never;
const sellerOrder = { orderId: 1, orderNumber: 'ORD-1', buyerName: 'Buyer', status: 'Processing', total: 100, itemCount: 1, createdAt: '2026-01-01T00:00:00Z', trackingNumber: null, items: [] } as never;
const adminProduct = { id: 1, name: 'Official card', game: 'Pokemon', type: 'Single', stock: 4, price: 100, costPrice: 50, active: true, imageUrl: null, approvalStatus: 'APPROVED' } as never;
const adminDashboard = { totalRevenue: 1000, totalExpenses: 500, totalProfit: 500, totalOrders: 3, totalItems: 4, averageOrderValue: 333, activeOfficialProducts: 2, lowStockProducts: 1, activeMarketplaceProducts: 1, pendingStoreVerifications: 0, pendingMarketplaceRequests: 0, monthlyMetrics: [], recentOrders: [] } as never;
const overview = { totalStores: 2, approvedStores: 1, pendingStores: 1, listedProducts: 4, activeListings: 3, gmvLast30Days: 1000, ordersLast30Days: 4, averageOrderValueLast30Days: 250, topStores: [], inStockListings: 2, lowStockListings: 1, outOfStockListings: 0, catalogByGame: [] } as never;
const user = { id: 1, username: 'seller', email: 'seller@test', phone: null, role: 'SELLER', storeId: 7, storeName: 'AAA Trading', storeStatus: 'APPROVED', createdAt: '2026-01-01' } as never;

describe('seller, admin and superadmin page coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sellerApi.loadMyStore).mockResolvedValue(store);
    vi.mocked(sellerApi.loadSellerProducts).mockResolvedValue([sellerProduct]);
    vi.mocked(sellerApi.loadSellerOrders).mockResolvedValue([sellerOrder]);
    vi.mocked(sellerApi.updateSellerOrderStatus).mockResolvedValue({ ...sellerOrder, status: 'Shipped', trackingNumber: 'TRK-1' });
    vi.mocked(stockApi.loadStockAlerts).mockResolvedValue([]);
    vi.mocked(stockApi.loadStockAlertSettings).mockResolvedValue({ defaultThreshold: 5 });
    vi.mocked(adminApi.loadAdminDashboard).mockResolvedValue(adminDashboard);
    vi.mocked(adminApi.loadAdminProducts).mockResolvedValue([adminProduct]);
    vi.mocked(adminApi.loadAdminStores).mockResolvedValue([store]);
    vi.mocked(adminApi.loadStockAlertSettings).mockResolvedValue({ defaultThreshold: 5 });
    vi.mocked(adminApi.deleteAdminProduct).mockResolvedValue(undefined);
    vi.mocked(superadminApi.loadSuperAdminOverview).mockResolvedValue(overview);
    vi.mocked(superadminApi.loadSuperAdminUsers).mockResolvedValue([user]);
  });
  afterEach(() => cleanup());

  it('renders seller inventory, dashboard and order management data', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Seller /></MemoryRouter>);
    expect(await screen.findByText('AAA Trading')).toBeInTheDocument();
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><Dashboard /></MemoryRouter>);
    expect(await screen.findByText(/Total Products/i)).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><OrdersManagement /></MemoryRouter>);
    expect(await screen.findByText('ORD-1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Processing/ }));
    await user.type(screen.getByPlaceholderText(/Search Order/), 'ORD-1');
    await user.click(screen.getByText('ORD-1'));
    expect(screen.getByText(/Customer Information/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.type(screen.getByLabelText(/Tracking number for ORD-1/), 'TRK-1');
    await user.selectOptions(screen.getByDisplayValue('Processing'), 'Shipped');
    await waitFor(() => expect(sellerApi.updateSellerOrderStatus).toHaveBeenCalled());
  });

  it('renders admin dashboard and stock/store screens', async () => {
    render(<MemoryRouter><ADdashboard /></MemoryRouter>);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Revenue chart')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><ADstocks /></MemoryRouter>);
    expect(await screen.findByText('Official card')).toBeInTheDocument();
    await userEvent.setup().selectOptions(screen.getByDisplayValue('Visibility: All'), 'ACTIVE');
    await userEvent.setup().type(screen.getByPlaceholderText(/Search product ID/), 'Official');
    const threshold = screen.getByLabelText('Default threshold');
    fireEvent.change(threshold, { target: { value: '8' } });
    await userEvent.setup().click(screen.getByRole('button', { name: 'Save threshold' }));
    await waitFor(() => expect(adminApi.updateStockAlertSettings).toHaveBeenCalledWith(8));
    await userEvent.setup().click(screen.getByRole('button', { name: 'Add product' }));
    cleanup();
    render(<MemoryRouter><AD_MarketplaceProducts /></MemoryRouter>);
    expect(await screen.findByText('AAA Trading')).toBeInTheDocument();
  });

  it('shows recoverable API errors on seller and admin pages', async () => {
    vi.mocked(sellerApi.loadSellerProducts).mockRejectedValue(new Error('seller offline'));
    render(<MemoryRouter><Seller /></MemoryRouter>);
    expect(await screen.findByText('seller offline')).toBeInTheDocument();
    cleanup();
    vi.mocked(adminApi.loadAdminDashboard).mockRejectedValue(new Error('admin offline'));
    render(<MemoryRouter><ADdashboard /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('admin offline');
  });

  it('renders superadmin overview and user management', async () => {
    render(<MemoryRouter><SPAD_Overview /></MemoryRouter>);
    expect(await screen.findByText('Platform Overview')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><SPAD_Users /></MemoryRouter>);
    expect(await screen.findByText('seller@test')).toBeInTheDocument();
  });
});

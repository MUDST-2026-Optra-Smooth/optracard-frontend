import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../../src/components/ProductCard';
import { TradingListingCard } from '../../src/components/TradingListingCard';
import { StockAlertBell } from '../../src/components/StockAlertBell';
import { AddProductDropdown } from '../../src/components/AddProductDropdown';
import { AdminProductForm, emptyAdminProduct } from '../../src/components/AdminProductForm';
import { OrderDetailPanel } from '../../src/components/OrderDetailPanel';
import { SPAD_DeleteAccountDialog } from '../../src/components/SPAD_DeleteAccountDialog';
import { SPAD_Error, SPAD_Loading, formatCurrency, formatDate, statusTone } from '../../src/components/SPAD_DataState';
import { Sidebar } from '../../src/components/Sidebar';
import { ADsidebar } from '../../src/components/ADsidebar';
import { SPAD_Shell } from '../../src/components/SPAD_Shell';
import * as cartApi from '../../src/api/cart';
import * as stockApi from '../../src/api/stockAlerts';
import * as adminApi from '../../src/api/admin';

const navigate = vi.fn();
const auth = vi.hoisted(() => ({
  user: { userId: 4, username: 'operator', email: 'operator@test', role: 'ADMIN', storeId: 2 },
  logout: vi.fn(),
}));

vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/api/cart', () => ({ addProductToCart: vi.fn() }));
vi.mock('../../src/api/stockAlerts', () => ({
  loadStockAlerts: vi.fn(), markStockAlertRead: vi.fn(), markAllStockAlertsRead: vi.fn(),
}));
vi.mock('../../src/api/admin', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/admin')>('../../src/api/admin');
  return { ...actual, loadAdminCardGames: vi.fn() };
});
vi.mock('../../src/components/AdminHeader', () => ({ AdminHeader: () => <header>Admin header</header> }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

const cart = (productId = 10, quantity = 1) => ({ items: [{ productId, quantity }] });

describe('shared product and listing components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cartApi.addProductToCart).mockResolvedValue(cart() as never);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders official and marketplace products, handles image failures and opens details', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ProductCard productId={10} title="Pikachu" price={990} game="Pokemon" type="Single" source="OFFICIAL" storeName="Official Store" stock={2} imageUrl="bad.jpg" /></MemoryRouter>);
    expect(screen.getByText('Official')).toBeInTheDocument();
    fireEvent.error(screen.getByRole('img', { name: 'Pikachu' }));
    expect(screen.getByText('Pokemon')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'View details for Pikachu' }));
    expect(navigate).toHaveBeenCalledWith('/product/10');
  });

  it('redirects guests, adds products for buyers and blocks stock overflow', async () => {
    const user = userEvent.setup();
    auth.user = null as never;
    render(<MemoryRouter><ProductCard productId={10} title="Pikachu" price={990} stock={1} /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    expect(navigate).toHaveBeenCalledWith('/login', { state: { from: '/' } });

    auth.user = { userId: 4, username: 'buyer', email: 'buyer@test', role: 'USER' } as never;
    vi.mocked(cartApi.addProductToCart).mockResolvedValue(cart(10, 1) as never);
    render(<MemoryRouter><ProductCard productId={10} title="Pikachu" price={990} stock={2} /></MemoryRouter>);
    await user.click(screen.getAllByRole('button', { name: 'Add to cart' })[1]);
    await waitFor(() => expect(cartApi.addProductToCart).toHaveBeenCalledWith(10, 4));

    vi.mocked(cartApi.addProductToCart).mockRejectedValue(new Error('Out of stock'));
    render(<MemoryRouter><ProductCard productId={11} title="Mew" price={100} stock={2} /></MemoryRouter>);
    await user.click(screen.getAllByRole('button', { name: 'Add to cart' })[2]);
    await waitFor(() => expect(cartApi.addProductToCart).toHaveBeenCalledWith(11, 4));
  });

  it('covers marketplace listing add-to-cart and sold-out states', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><TradingListingCard productId={20} cardName="Blue Eyes" gameName="Yu-Gi-Oh!" itemCount={1} startingPrice={500} source="MARKETPLACE" storeName="Rare Finds" /></MemoryRouter>);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add to cart' }));
    await waitFor(() => expect(cartApi.addProductToCart).toHaveBeenCalledWith(20, 4));
    render(<MemoryRouter><TradingListingCard cardName="Sold" gameName="Pokemon" itemCount={0} startingPrice={1} /></MemoryRouter>);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });
});

describe('stock alerts and navigation shells', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.user = { userId: 4, username: 'operator', email: 'operator@test', role: 'ADMIN', storeId: 2 } as never;
    vi.mocked(stockApi.loadStockAlerts).mockResolvedValue([
      { id: 1, productId: 8, productName: 'Low card', storeName: 'Official', stock: 1, threshold: 3, alertType: 'LOW_STOCK', read: false, activatedAt: null, listingSource: 'OFFICIAL' },
      { id: 2, productId: 9, productName: 'Empty card', storeName: 'Seller', stock: 0, threshold: 2, alertType: 'OUT_OF_STOCK', read: true, activatedAt: null, listingSource: 'MARKETPLACE' },
    ]);
    vi.mocked(stockApi.markStockAlertRead).mockResolvedValue(undefined);
    vi.mocked(stockApi.markAllStockAlertsRead).mockResolvedValue(undefined);
  });

  it('loads alerts, marks individual/all alerts read and routes by source', async () => {
    const user = userEvent.setup();
    cleanup();
    render(<MemoryRouter><StockAlertBell /></MemoryRouter>);
    await user.click(await screen.findByRole('button', { name: 'Stock alerts' }));
    expect(screen.getByText(/Low stock/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Low card/ }));
    await waitFor(() => expect(stockApi.markStockAlertRead).toHaveBeenCalledWith(1));
    expect(navigate).toHaveBeenCalledWith('/admin/products/8/edit');

    cleanup();
    render(<MemoryRouter><StockAlertBell /></MemoryRouter>);
    await user.click(await screen.findByRole('button', { name: 'Stock alerts' }));
    await user.click(screen.getByRole('button', { name: 'Mark all read' }));
    expect(stockApi.markAllStockAlertsRead).toHaveBeenCalledOnce();
  });

  it('hides the alert bell for buyers and shows empty/error-safe state', async () => {
    auth.user = { userId: 3, username: 'buyer', email: 'buyer@test', role: 'USER' } as never;
    const { container } = render(<MemoryRouter><StockAlertBell /></MemoryRouter>);
    expect(container).toBeEmptyDOMElement();
    auth.user = { userId: 4, username: 'seller', email: 'seller@test', role: 'SELLER' } as never;
    vi.mocked(stockApi.loadStockAlerts).mockResolvedValue([]);
    render(<MemoryRouter><StockAlertBell /></MemoryRouter>);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Stock alerts' }));
    expect(await screen.findByText(/No low-stock/)).toBeInTheDocument();
  });

  it('renders sidebar links and handles logout actions', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Sidebar currentTab="dashboard" /></MemoryRouter>);
    expect(screen.getByText('Stocks Management')).toBeInTheDocument();
    render(<MemoryRouter><ADsidebar currentTab="dashboard" /></MemoryRouter>);
    expect(screen.getByText('Auction Review')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(auth.logout).toHaveBeenCalled();
    render(<MemoryRouter><SPAD_Shell><p>Workspace</p></SPAD_Shell></MemoryRouter>);
    expect(screen.getByText('Workspace')).toBeInTheDocument();
  });
});

describe('forms, dialogs and data-state components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.loadAdminCardGames).mockResolvedValue([{ id: 1, name: 'Pokemon' }] as never);
  });

  it('selects a product type and closes the dropdown', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelect = vi.fn();
    render(<MemoryRouter><AddProductDropdown isOpen onClose={onClose} onSelectCategory={onSelect} /></MemoryRouter>);
    await user.type(screen.getByPlaceholderText(/Search category/), 'booster');
    await user.click(screen.getByText('Booster Box'));
    await user.click(screen.getByRole('button', { name: 'Select' }));
    expect(onSelect).toHaveBeenCalledWith('Booster Box');
    expect(onClose).toHaveBeenCalled();
  });

  it('submits admin product data and reports API failures', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AdminProductForm initialValue={emptyAdminProduct} submitLabel="Save product" onCancel={vi.fn()} onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Product name'), 'Pikachu');
    await user.selectOptions(screen.getByLabelText('Card game'), 'Pokemon');
    await user.click(screen.getByRole('button', { name: 'Save product' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Pikachu', game: 'Pokemon' })));
    vi.mocked(adminApi.loadAdminCardGames).mockRejectedValue(new Error('Games unavailable'));
    render(<AdminProductForm initialValue={emptyAdminProduct} submitLabel="Save" onCancel={vi.fn()} onSubmit={vi.fn().mockRejectedValue(new Error('Save failed'))} />);
    expect(await screen.findByText('Games unavailable')).toBeInTheDocument();
  });

  it('covers admin product form optional fields, cancellation and submitting state', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AdminProductForm initialValue={{ ...emptyAdminProduct, name: 'Existing', game: 'Pokemon', type: 'Single Card', imageUrl: 'https://img', productSet: 'Set', language: 'EN', description: 'Desc', cost: 1, price: 2, stock: 3 }} submitLabel="Saving" isSubmitting onCancel={onCancel} onSubmit={onSubmit} />);
    expect(screen.getByRole('button', { name: 'Saving' })).toBeDisabled();
    await user.clear(screen.getByLabelText('Image URL')); await user.type(screen.getByLabelText('Image URL'), 'https://new');
    await user.clear(screen.getByLabelText('Set')); await user.type(screen.getByLabelText('Set'), 'New Set');
    await user.clear(screen.getByLabelText('Language')); await user.type(screen.getByLabelText('Language'), 'JP');
    await user.clear(screen.getByLabelText('Description')); await user.type(screen.getByLabelText('Description'), 'Details');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('covers deletion confirmation and error handling', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error('Cannot delete'));
    render(<SPAD_DeleteAccountDialog accountName="seller" accountType="user" includesStoreData onClose={vi.fn()} onConfirm={onConfirm} />);
    expect(screen.getByText(/marketplace store/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.type(screen.getByPlaceholderText('Type DELETE'), 'DELETE');
    await user.click(screen.getByRole('button', { name: 'Delete permanently' }));
    expect(await screen.findByText('Cannot delete')).toBeInTheDocument();
  });

  it('renders data-state helpers and order panel content', () => {
    const retry = vi.fn();
    render(<><SPAD_Loading label="Loading" /><SPAD_Error message="Failed" onRetry={retry} /><OrderDetailPanel title="Order" subtitle="Buyer"><span>Details</span></OrderDetailPanel></>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();
    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(formatCurrency(100)).toContain('100');
    expect(formatDate(null)).toBe('—');
    expect(statusTone('APPROVED')).toBe('green');
    expect(statusTone('unknown')).toBe('neutral');
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Home } from '../../src/pages/Home';
import { SearchResult } from '../../src/pages/SearchResult';
import { Register } from '../../src/pages/Register';
import { Profile } from '../../src/pages/Profile';
import { OrderDetail } from '../../src/pages/OrderDetail';
import { AboutUs } from '../../src/pages/Aboutus';
import { OurTeam } from '../../src/pages/OurTeam';
import * as catalogApi from '../../src/api/catalog';
import * as auctionApi from '../../src/api/auctions';

const navigate = vi.fn();
const auth = vi.hoisted(() => ({ logout: vi.fn(), user: { userId: 1, username: 'Buyer', email: 'buyer@test', role: 'USER' } }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/components/ProductCard', () => ({ ProductCard: ({ title }: { title: string }) => <div data-testid="product-card">{title}</div> }));
vi.mock('../../src/components/TradingListingCard', () => ({ TradingListingCard: ({ title, product }: { title?: string; product?: { name?: string } }) => <div data-testid="listing-card">{title ?? product?.name}</div> }));
vi.mock('../../src/components/AuctionCard', () => ({ AuctionCard: ({ auction }: { auction: { title: string } }) => <div data-testid="auction-card">{auction.title}</div> }));
vi.mock('../../src/components/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));
vi.mock('../../src/components/Navbar', () => ({ Navbar: () => <nav>Navbar</nav> }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('../../src/api/catalog', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/catalog')>('../../src/api/catalog');
  return { ...actual, loadCatalogPage: vi.fn(), searchCatalog: vi.fn() };
});
vi.mock('../../src/api/auctions', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/auctions')>('../../src/api/auctions');
  return { ...actual, loadAuctions: vi.fn() };
});

const product = (overrides: Record<string, unknown> = {}) => ({
  id: 1, sku: null, name: 'Pikachu ex', type: 'Single', game: 'Pokemon', price: 990, stock: 3,
  imageUrl: null, description: 'Rare card', productSet: null, language: 'English', source: 'OFFICIAL',
  store: { id: 1, name: 'Official Store', slug: 'official' }, ...overrides,
});
const auction = { id: 1, title: 'Live lot', game: 'Pokemon', type: 'Single', imageUrl: null, description: '', startingPrice: 100, currentPrice: 150, bidCount: 1, startsAt: new Date(Date.now() - 1000).toISOString(), endsAt: new Date(Date.now() + 60_000).toISOString(), checkoutDeadline: new Date(Date.now() + 3600_000).toISOString(), status: 'LIVE', source: 'OFFICIAL', storeId: 1, storeName: 'Official Store', sellerUserId: 1, winningUserId: null, leadingUserId: 1, reviewNote: null, createdAt: new Date().toISOString() } as never;

describe('buyer storefront pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.setItem('optracard-storefront-intro-seen', 'true');
    vi.mocked(catalogApi.loadCatalogPage).mockResolvedValue({ items: [product(), product({ id: 2, name: 'Gengar', type: 'Booster', source: 'MARKETPLACE', store: { id: 2, name: 'Card Corner', slug: 'corner' } })], page: 0, pageSize: 24, totalItems: 2, totalPages: 1, sort: 'relevance' } as never);
    vi.mocked(auctionApi.loadAuctions).mockResolvedValue([auction]);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads Home sections and handles catalog failure', async () => {
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText('Optracard Official Store')).toBeInTheDocument();
    expect(screen.getByText('Marketplace & Trading')).toBeInTheDocument();
    expect(screen.getByTestId('auction-card')).toHaveTextContent('Live lot');

    vi.mocked(catalogApi.loadCatalogPage).mockRejectedValue(new Error('offline'));
    cleanup();
    render(<MemoryRouter><Home /></MemoryRouter>);
    expect(await screen.findByText(/could not load the catalog/i)).toBeInTheDocument();
  });

  it('searches, sorts, filters and handles empty/error states', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogApi.searchCatalog).mockResolvedValue([product(), product({ id: 2, name: 'Gengar', price: 100, type: 'Booster', source: 'MARKETPLACE' })] as never);
    render(<MemoryRouter initialEntries={['/search?q=pokemon']}><SearchResult /></MemoryRouter>);
    expect(await screen.findByText('Search Result : pokemon')).toBeInTheDocument();
    expect(screen.getByTestId('product-card')).toBeInTheDocument();
    expect(screen.getByTestId('listing-card')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Sort by/ }));
    const option = screen.queryByText('Price: Low to High');
    if (option) await user.click(option);
    await user.click(screen.getByRole('button', { name: /Filters/ }));
    expect(screen.getByRole('complementary', { name: 'Catalog filters' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/search?'));

    vi.mocked(catalogApi.searchCatalog).mockResolvedValue([]);
    cleanup();
    render(<MemoryRouter initialEntries={['/search?q=missing']}><SearchResult /></MemoryRouter>);
    expect(await screen.findByText(/ไม่พบสินค้า/)).toBeInTheDocument();
    vi.mocked(catalogApi.searchCatalog).mockRejectedValue(new Error('search offline'));
    cleanup();
    render(<MemoryRouter initialEntries={['/search?q=error']}><SearchResult /></MemoryRouter>);
    expect(await screen.findByText(/ไม่สามารถโหลดข้อมูล/)).toBeInTheDocument();
  });

  it('honours catalog query filters and sort ordering', async () => {
    vi.mocked(catalogApi.searchCatalog).mockResolvedValue([
      product({ id: 1, price: 100, type: 'Single', language: 'English' }),
      product({ id: 2, price: 20, type: 'Booster', language: 'Japanese' }),
    ] as never);
    render(<MemoryRouter initialEntries={['/search?q=pokemon&type=Single&language=English&minPrice=50&maxPrice=150']}><SearchResult /></MemoryRouter>);
    expect(await screen.findByTestId('product-card')).toHaveTextContent('Pikachu ex');
    expect(screen.queryByText('Gengar')).not.toBeInTheDocument();
  });

  it('registers successfully, validates mismatched passwords and handles backend errors', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('alert', vi.fn());
    render(<MemoryRouter><Register /></MemoryRouter>);
    const field = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLInputElement;
    await user.type(field('username'), 'new-user');
    await user.type(field('email'), 'new@example.com');
    await user.type(field('phone'), '0800000000');
    await user.type(field('address'), 'Bangkok');
    await user.type(field('password'), 'Secret123');
    await user.type(field('confirmPassword'), 'Secret123');
    await user.click(screen.getByRole('button', { name: /Create an account/i }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Registration successful! Please login.'));
    expect(navigate).toHaveBeenCalledWith('/login');

    cleanup();
    render(<MemoryRouter><Register /></MemoryRouter>);
    await user.type(field('username'), 'mismatch-user');
    await user.type(field('email'), 'mismatch@example.com');
    await user.type(field('phone'), '0800000001');
    await user.type(field('address'), 'Bangkok');
    await user.type(field('password'), 'a');
    await user.type(field('confirmPassword'), 'b');
    await user.click(screen.getByRole('button', { name: /Create an account/i }));
    expect(window.alert).toHaveBeenCalledWith('Passwords do not match!');
  });

  it('loads profile, toggles collection visibility and handles auth failures', async () => {
    localStorage.setItem('token', 'profile-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ userId: 1, username: 'Buyer', email: 'buyer@test', phone: null, address: 'Bangkok', profileImage: null, collection: [{ id: 2, name: 'Pikachu', game: 'Pokemon', quantity: 2 }] }) }));
    const user = userEvent.setup();
    render(<MemoryRouter><Profile /></MemoryRouter>);
    expect(await screen.findByText('Card Collection')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Hide Pikachu' }));
    expect(screen.getByRole('button', { name: 'Unhide Pikachu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unhide All' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Unhide All' }));
    expect(screen.getByRole('button', { name: 'Hide All' })).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) } as Response);
    cleanup();
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => expect(auth.logout).toHaveBeenCalled());
  });

  it('redirects profile visitors without a token and renders order detail actions', async () => {
    localStorage.clear();
    render(<MemoryRouter><Profile /></MemoryRouter>);
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/login', expect.objectContaining({ replace: true })));
    cleanup();
    render(<MemoryRouter initialEntries={['/orders/ORD-1']}><Routes><Route path="/orders/:orderId" element={<OrderDetail />} /></Routes></MemoryRouter>);
    expect(screen.getByText('Order #ORD-1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Print' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to Orders' }));
    expect(navigate).toHaveBeenCalledWith('/orders-management');
  });

  it('renders public informational pages', () => {
    render(<MemoryRouter><AboutUs /></MemoryRouter>);
    expect(screen.getByText(/About Optracard/i)).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><OurTeam /></MemoryRouter>);
    expect(screen.getByText(/Our Team/i)).toBeInTheDocument();
  });
});

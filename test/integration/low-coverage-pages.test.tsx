/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const seller = vi.hoisted(() => ({
  loadSellerGames: vi.fn(), createSellerProduct: vi.fn(), loadSellerProduct: vi.fn(),
  updateSellerProduct: vi.fn(), updateSellerProductActive: vi.fn(), loadMyStore: vi.fn(),
}));
const catalog = vi.hoisted(() => ({ searchCatalog: vi.fn(), loadMarketplaceStore: vi.fn() }));
const superadmin = vi.hoisted(() => ({ createSuperAdminStaff: vi.fn() }));
const orders = vi.hoisted(() => ({ reorderOrder: vi.fn() }));
const auth = vi.hoisted(() => ({ user: { userId: 2, username: 'seller', role: 'SELLER' }, logout: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../../src/api/seller', () => seller);
vi.mock('../../src/api/catalog', () => catalog);
vi.mock('../../src/api/superadmin', () => superadmin);
vi.mock('../../src/api/orders', () => orders);
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/components/Sidebar', () => ({ default: () => <aside>Seller sidebar</aside> }));
vi.mock('../../src/components/ProductCard', () => ({ ProductCard: ({ title }: any) => <div>{title}</div> }));
vi.mock('../../src/components/SPAD_Shell', () => ({ SPAD_Shell: ({ children }: any) => <main>{children}</main> }));
vi.mock('../../src/components/SPAD_Widgets', () => ({
  SPAD_Field: ({ label, children }: any) => <label>{label}{children}</label>,
  SPAD_Input: (props: any) => <input {...props} />,
  SPAD_Panel: ({ children, title }: any) => <section><h2>{title}</h2>{children}</section>,
  SPAD_SectionHeading: ({ title, action }: any) => <header><h1>{title}</h1>{action}</header>,
}));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

import AddProduct from '../../src/pages/AddProduct';
import EditProduct from '../../src/pages/EditProduct';
import { SellerProfile } from '../../src/pages/SellerProfile';
import { SPAD_AddAdmin } from '../../src/pages/SPAD_AddAdmin';
import { OrderHistoryDetail } from '../../src/pages/OrderHistoryDetail';
import { encodeStoreId } from '../../src/utils/storeSecurity';

const product = { id: 9, name: 'Gengar', game: 'Pokemon', type: 'Single', cost: 5, price: 10, stock: 3, active: true, imageUrl: null, productSet: 'Set', language: 'English', description: 'Rare', source: 'MARKETPLACE', store: { id: 2, name: 'Seller Store', slug: 'seller-store' } } as any;
const store = { id: 2, name: 'Seller Store', slug: 'seller-store', storeId: 2, storeName: 'Seller Store', sellerName: 'seller', products: [product], status: 'APPROVED', description: 'Store', location: 'Bangkok', profileImage: null } as any;
const router = (element: React.ReactNode, path: string, entry: string) => render(<MemoryRouter initialEntries={[entry]}><Routes><Route path={path} element={element} /></Routes></MemoryRouter>);

describe('low coverage pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seller.loadSellerGames.mockResolvedValue([{ id: 1, name: 'Pokemon' }]);
    seller.createSellerProduct.mockResolvedValue({ id: 20 });
    seller.loadSellerProduct.mockResolvedValue(product);
    seller.updateSellerProduct.mockResolvedValue(undefined);
    seller.updateSellerProductActive.mockResolvedValue({ ...product, active: false });
    seller.loadMyStore.mockResolvedValue({ storeId: 2 });
    catalog.searchCatalog.mockResolvedValue([]);
    catalog.loadMarketplaceStore.mockResolvedValue(store);
    superadmin.createSuperAdminStaff.mockResolvedValue(undefined);
    orders.reorderOrder.mockResolvedValue({ orderNumber: 'ORD-1', addedCount: 1, skippedCount: 0, added: [], skipped: [] });
    auth.user = { userId: 2, username: 'seller', role: 'SELLER' } as any;
  });
  afterEach(() => cleanup());

  it('creates a seller product and handles template search', async () => {
    router(<AddProduct />, '/seller/products/new', '/seller/products/new');
    expect(await screen.findByText('Seller sidebar')).toBeInTheDocument();
    const name = screen.getByPlaceholderText(/One Piece PRB/i);
    catalog.searchCatalog.mockResolvedValue([{ ...product, name: 'Gengar' }]);
    fireEvent.change(name, { target: { value: 'Gengar' } });
    await new Promise((resolve) => setTimeout(resolve, 450));
    expect(await screen.findByText('Use this product')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Use this product/i }));
    fireEvent.submit(screen.getByRole('button', { name: /Submit for approval/i }).closest('form')!);
    await waitFor(() => expect(seller.createSellerProduct).toHaveBeenCalled());
  });

  it('loads and edits seller product, including visibility toggle', async () => {
    router(<EditProduct />, '/seller/products/:id/edit', '/seller/products/9/edit');
    expect(await screen.findByDisplayValue('Gengar')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Set inactive/i }));
    await waitFor(() => expect(seller.updateSellerProductActive).toHaveBeenCalledWith(9, false));
    fireEvent.click(screen.getByRole('button', { name: /Save and resubmit/i }));
    await waitFor(() => expect(seller.updateSellerProduct).toHaveBeenCalled());
  });

  it('loads own seller profile and sorts products', async () => {
    router(<SellerProfile isOwnerOnly />, '/seller-profile/my', '/seller-profile/my');
    expect(await screen.findByText('Seller Store')).toBeInTheDocument();
    const selects = screen.getAllByRole('combobox');
    if (selects.length) fireEvent.change(selects[0], { target: { value: 'price-low' } });
    expect(screen.getByText('Gengar')).toBeInTheDocument();
  });

  it('handles invalid and unavailable seller profile addresses', async () => {
    auth.user = { userId: 2, username: 'buyer', role: 'USER' } as any;
    router(<SellerProfile />, '/seller-profile/:sellerId', '/seller-profile/not-a-store');
    expect(await screen.findByText(/Invalid or expired store address/i)).toBeInTheDocument();
    cleanup();
    seller.loadMyStore.mockResolvedValueOnce(null);
    router(<SellerProfile isOwnerOnly />, '/seller-profile/my', '/seller-profile/my');
    expect(await screen.findByText(/Your seller store profile could not be found/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Back to Dashboard/i }));
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('blocks seller traversal and supports public storefront sorting/empty state', async () => {
    auth.user = { userId: 2, username: 'seller', role: 'SELLER' } as any;
    seller.loadMyStore.mockResolvedValue({ storeId: 2 });
    router(<SellerProfile />, '/seller-profile/:sellerId', `/seller-profile/${encodeStoreId(9)}`);
    expect(await screen.findByText(/URL traversal detected/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Go to My Storefront/i }));
    expect(navigate).toHaveBeenCalledWith('/seller-profile/my');
    cleanup();
    auth.user = { userId: 1, username: 'buyer', role: 'USER' } as any;
    seller.loadMyStore.mockResolvedValue({ storeId: 2 });
    catalog.loadMarketplaceStore.mockResolvedValue({ ...store, products: [] });
    router(<SellerProfile />, '/seller-profile/:sellerId', `/seller-profile/${encodeStoreId(2)}`);
    expect(await screen.findByText(/does not have a live listing/i)).toBeInTheDocument();
  });

  it('shows seller API failure state and high-to-low sorting', async () => {
    auth.user = { userId: 1, username: 'buyer', role: 'USER' } as any;
    catalog.loadMarketplaceStore.mockRejectedValueOnce(new Error('store unavailable'));
    router(<SellerProfile />, '/seller-profile/:sellerId', `/seller-profile/${encodeStoreId(2)}`);
    expect(await screen.findByText('store unavailable')).toBeInTheDocument();
    cleanup();
    catalog.loadMarketplaceStore.mockResolvedValue({ ...store, products: [{ ...product, id: 1, price: 100 }, { ...product, id: 2, price: 300 }] });
    router(<SellerProfile />, '/seller-profile/:sellerId', `/seller-profile/${encodeStoreId(2)}`);
    await screen.findByText('Seller Store');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price-high' } });
    expect(screen.getAllByText('Gengar').length).toBe(2);
  });

  it('creates a superadmin staff account and reports API errors', async () => {
    router(<SPAD_AddAdmin />, '/superadmin/staff/new', '/superadmin/staff/new');
    fireEvent.change(screen.getByPlaceholderText('e.g. ops_admin'), { target: { value: 'ops' } });
    fireEvent.change(screen.getByPlaceholderText('name@optracard.com'), { target: { value: 'ops@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/At least 8/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create administrator/i }));
    await waitFor(() => expect(superadmin.createSuperAdminStaff).toHaveBeenCalled());
    superadmin.createSuperAdminStaff.mockRejectedValueOnce(new Error('cannot create'));
    fireEvent.click(screen.getByRole('button', { name: /Create administrator/i }));
    expect(await screen.findByText('cannot create')).toBeInTheDocument();
  });

  it('loads order history detail and handles reorder', async () => {
    localStorage.setItem('token', 'token');
    const raw = { orderNumber: 'ORD-1', createdAt: '2026-01-01', storeName: 'Official Store', status: 'Processing', paymentStatus: 'PAID', shippingMethod: 'Standard', trackingNumber: 'TRK', items: [{ productId: 1, name: 'Gengar', game: 'Pokemon', price: 10, quantity: 1 }], subtotal: 10, shippingFee: 0, discountAmount: 0, total: 10, shippingAddress: 'Bangkok' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => raw }));
    router(<OrderHistoryDetail />, '/order-history/:orderNumber', '/order-history/ORD-1');
    expect(await screen.findByRole('heading', { name: /ORD-1/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Order again' }));
    await waitFor(() => expect(orders.reorderOrder).toHaveBeenCalledWith('ORD-1'));
    localStorage.removeItem('token');
  });
});

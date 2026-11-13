import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentSuccess } from '../../src/pages/PaymentSuccess';
import ProductDetail from '../../src/pages/PDdetail';
import * as catalogApi from '../../src/api/catalog';
import * as cartApi from '../../src/api/cart';

const navigate = vi.fn();
const auth = vi.hoisted(() => ({ user: { userId: 1, username: 'Buyer', role: 'USER' }, logout: vi.fn() }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});
vi.mock('../../src/api/catalog', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/catalog')>('../../src/api/catalog');
  return { ...actual, loadProduct: vi.fn(), loadProductOffers: vi.fn() };
});
vi.mock('../../src/api/cart', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/cart')>('../../src/api/cart');
  return { ...actual, addProductToCart: vi.fn() };
});

const product = { id: 4, name: 'Pikachu ex', game: 'Pokemon', type: 'Single', price: 990, stock: 3, imageUrl: 'https://example.test/card.png', description: 'Rare card', productSet: 'Set A', language: 'English', source: 'OFFICIAL', store: { id: 1, name: 'Official Store', slug: 'official' } } as never;

describe('product detail and payment success', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogApi.loadProduct).mockResolvedValue(product);
    vi.mocked(catalogApi.loadProductOffers).mockResolvedValue([product]);
    vi.mocked(cartApi.addProductToCart).mockResolvedValue(undefined);
  });
  afterEach(() => cleanup());

  it('renders product detail, changes quantity and adds to cart', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter initialEntries={['/product/4']}><Routes><Route path="/product/:id" element={<ProductDetail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Pikachu ex')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /increase quantity/i }));
    await user.click(screen.getByRole('button', { name: /Add to cart/i }));
    await waitFor(() => expect(cartApi.addProductToCart).toHaveBeenCalledTimes(2));
    expect(cartApi.addProductToCart).toHaveBeenCalledWith(4, 1);
    expect(screen.getByText(/Added 2 items to cart/i)).toBeInTheDocument();
  });

  it('handles invalid and unavailable product detail states', async () => {
    render(<MemoryRouter initialEntries={['/product/nope']}><Routes><Route path="/product/:id" element={<ProductDetail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('Invalid product id.')).toBeInTheDocument();
    cleanup();
    vi.mocked(catalogApi.loadProduct).mockRejectedValue(new Error('product offline'));
    render(<MemoryRouter initialEntries={['/product/4']}><Routes><Route path="/product/:id" element={<ProductDetail />} /></Routes></MemoryRouter>);
    expect(await screen.findByText('product offline')).toBeInTheDocument();
  });

  it('renders payment success variants and navigation', async () => {
    render(<MemoryRouter initialEntries={[{ pathname: '/success', state: { orderNumbers: ['ORD-1', 'ORD-2'], paymentMethod: 'qr', shippingMethod: 'pickup', recipientName: 'Buyer', recipientPhone: '0800', shippingAddress: 'Bangkok', total: 1000 } }]}><PaymentSuccess /></MemoryRouter>);
    expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    expect(screen.getByText('QR Code Payment')).toBeInTheDocument();
    expect(screen.getByText('Store Pickup')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Return to Home/i }));
    expect(navigate).toHaveBeenCalledWith('/');
    cleanup();
    render(<MemoryRouter initialEntries={[{ pathname: '/success', state: { paymentMethod: 'cash', shippingMethod: 'standard', total: 0 } }]}><PaymentSuccess /></MemoryRouter>);
    expect(screen.getByText('Order Placed Successfully!')).toBeInTheDocument();
    expect(screen.getByText('Cash Payment')).toBeInTheDocument();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../src/context/AuthContext';
import { Cart } from '../../src/pages/Cart';

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('Cart promotion feedback', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ userId: 7, username: 'Kendo', email: 'kendo@example.com', role: 'USER' }));
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('redirects unauthenticated visitors to login', async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    render(<MemoryRouter initialEntries={['/cart']}><AuthProvider><Routes><Route path="/cart" element={<Cart />} /><Route path="/login" element={<p>Login screen</p>} /></Routes></AuthProvider></MemoryRouter>);
    expect(await screen.findByText('Login screen')).toBeInTheDocument();
  });

  it('shows a profile or cart loading error when the API is unavailable', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ username: 'Kendo', role: 'USER' }));
    vi.stubGlobal('fetch', vi.fn(() => json({ message: 'Profile unavailable' }, 503)));
    render(<MemoryRouter><AuthProvider><Cart /></AuthProvider></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not identify the logged-in user.');
  });

  it('shows the reason next to the code field when a promotion cannot be applied', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/profile')) return json({ userId: 7, username: 'Kendo', email: 'kendo@example.com' });
      if (url.includes('/api/cart/7')) return json({
        items: [{ productId: 1, quantity: 1, name: 'Pikachu', game: 'Pokemon', category: 'Single', price: 990, stock: 2, storeName: 'Optracard Official Store' }],
        subtotal: 990,
        totalItemCount: 1,
      });
      if (url.includes('/api/orders/promotion-preview')) return json({ message: 'This promotion has expired' }, 400);
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<MemoryRouter><AuthProvider><Cart /></AuthProvider></MemoryRouter>);

    const codeInput = await screen.findByLabelText('Promotion code');
    await userEvent.type(codeInput, 'SAVE50');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('This code cannot be applied: This promotion has expired.');
    expect(codeInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows the promotion rules after a code is applied', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string) => {
      if (url.includes('/api/profile')) return json({ userId: 7, username: 'Kendo', email: 'kendo@example.com' });
      if (url.includes('/api/cart/7')) return json({
        items: [{ productId: 1, quantity: 1, name: 'Pikachu', game: 'Pokemon', category: 'Single', price: 990, stock: 2, storeName: 'Optracard Official Store' }],
        subtotal: 990,
        totalItemCount: 1,
      });
      if (url.includes('/api/orders/promotion-preview')) return json({
        code: 'HALF50', name: 'Half price card sale', subtotal: 990, discountAmount: 100, discountedSubtotal: 890,
        discountType: 'PERCENTAGE', discountValue: 50, maximumDiscountAmount: 100, minimumOrderAmount: 500, perUserLimit: 1,
      });
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<MemoryRouter><AuthProvider><Cart /></AuthProvider></MemoryRouter>);

    await userEvent.type(await screen.findByLabelText('Promotion code'), 'HALF50');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(await screen.findByText('Half price card sale applied')).toBeInTheDocument();
    expect(screen.getByText(/50% off • Maximum discount/)).toHaveTextContent('50% off • Maximum discount ฿100.00 • Minimum order ฿500.00 • One use per customer');
  });

  it('blocks stock overflow immediately and removes an item through the API', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url.includes('/api/profile')) return json({ userId: 7, username: 'Kendo', email: 'kendo@example.com' });
      if (url.includes('/api/cart/7')) return json({ items: [{ productId: 1, quantity: 1, name: 'Pikachu', game: 'Pokemon', category: 'Single', price: 990, stock: 1, storeName: 'Official Store' }], subtotal: 990, totalItemCount: 1 });
      if (url.includes('/api/cart/remove')) return json({ items: [], subtotal: 0, totalItemCount: 0 });
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><AuthProvider><Cart /></AuthProvider></MemoryRouter>);
    await screen.findByText('Pikachu');
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/Only 1 item of Pikachu/);
    await userEvent.click(screen.getByRole('button', { name: 'Remove item' }));
    await screen.findByText(/Your cart is empty/i);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/cart/remove'), expect.objectContaining({ method: 'DELETE' }));
  });

  it('handles empty codes, fixed promotions, update failures and multi-seller checkout', async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (url.includes('/api/profile')) return json({ userId: 7, username: 'Kendo', email: 'kendo@example.com', phone: '0812345678', address: 'Bangkok' });
      if (url.includes('/api/cart/7')) return json({
        items: [
          { productId: 1, quantity: 1, name: 'Pikachu', game: 'Pokemon', category: 'Single', price: 990, stock: 4, storeName: 'Official Store' },
          { productId: 2, quantity: 1, name: 'Gengar', game: 'Pokemon', category: 'Single', price: 500, stock: 4, storeId: 3, storeName: 'Card Corner', source: 'MARKETPLACE' },
        ], subtotal: 1490, totalItemCount: 2,
      });
      if (url.includes('/api/orders/promotion-preview')) return json({ code: 'FIX100', name: 'Fixed discount', subtotal: 1490, discountAmount: 100, discountedSubtotal: 1390, discountType: 'FIXED_AMOUNT', discountValue: 100, maximumDiscountAmount: null, minimumOrderAmount: 0, perUserLimit: 2 });
      if (url.includes('/api/cart/update')) return json({ message: 'Stock changed' }, 409);
      if (url.includes('/api/orders') && options?.method === 'POST') return json({ orders: [{ orderNumber: 'ORD-1' }], total: 1490 });
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<MemoryRouter><AuthProvider><Cart /></AuthProvider></MemoryRouter>);
    await screen.findByText('Card Corner');

    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Enter a promotion code to apply it.');
    await userEvent.type(screen.getByLabelText('Promotion code'), 'fix100');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(await screen.findByText('Fixed discount applied')).toBeInTheDocument();
    expect(screen.getByText(/฿100.00 off • 2 uses per customer/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.queryByText('Fixed discount applied')).not.toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('button', { name: 'Increase quantity' })[0]);
    expect(await screen.findByRole('alert')).toHaveTextContent('Stock changed');
    await userEvent.click(screen.getByRole('button', { name: 'Place Order' }));
    expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Confirm Order/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/orders'), expect.objectContaining({ method: 'POST' })));
  });
});

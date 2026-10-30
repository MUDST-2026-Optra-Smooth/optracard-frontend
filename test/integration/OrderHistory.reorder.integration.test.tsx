import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { OrderHistory } from '../../src/pages/OrderHistory';

const order = {
  orderId: 1,
  orderNumber: 'ORD-20260101-0001',
  total: 9200,
  status: 'Delivered',
  createdAt: '2026-01-01T10:00:00',
  storeName: 'Optracard Official Store',
  source: 'OFFICIAL',
  shippingMethod: 'standard',
  items: [{ productId: 1, name: 'Charizard VMAX', game: 'Pokemon', price: 4500, quantity: 2 }],
};

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('Order history reorder', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  const renderHistory = () => render(<MemoryRouter><OrderHistory /></MemoryRouter>);

  it('tells the buyer which items were added and which were skipped', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return json({
          orderNumber: order.orderNumber, addedCount: 0, skippedCount: 1, added: [],
          skipped: [{ productId: 1, name: 'Charizard VMAX', requestedQuantity: 2, addedQuantity: 0, reason: 'OUT_OF_STOCK', message: 'Charizard VMAX is out of stock.' }],
        });
      }
      return json([order]);
    }));
    renderHistory();

    await userEvent.click(await screen.findByRole('button', { name: 'Order again' }));

    expect(await screen.findByText('Charizard VMAX is out of stock.')).toBeInTheDocument();
    expect(screen.getByText(`Nothing from order #${order.orderNumber} could be added to your cart.`)).toBeInTheDocument();
  });

  it('confirms a successful reorder and links to the cart', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return json({
          orderNumber: order.orderNumber, addedCount: 1, skippedCount: 0, skipped: [],
          added: [{ productId: 1, name: 'Charizard VMAX', requestedQuantity: 2, addedQuantity: 2, reason: null, message: null }],
        });
      }
      return json([order]);
    }));
    renderHistory();

    await userEvent.click(await screen.findByRole('button', { name: 'Order again' }));

    expect(await screen.findByText(`1 item from order #${order.orderNumber} added to your cart.`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to cart' })).toBeInTheDocument();
  });

  it('shows an error when the reorder request fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) =>
      init?.method === 'POST' ? json({ message: 'Order not found' }, 404) : json([order])));
    renderHistory();

    await userEvent.click(await screen.findByRole('button', { name: 'Order again' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Order not found');
  });
});

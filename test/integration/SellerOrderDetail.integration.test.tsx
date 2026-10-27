import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SellerOrderDetail } from '../../src/pages/SellerOrderDetail';
import type { SellerOrder } from '../../src/types/seller';

const loadSellerOrder = vi.fn();

vi.mock('../../src/api/seller', () => ({
  loadSellerOrder: (id: number) => loadSellerOrder(id),
}));

vi.mock('../../src/components/Sidebar', () => ({
  default: () => <nav aria-label="Seller sidebar" />,
}));

const order: SellerOrder = {
  orderId: 44,
  orderNumber: 'ORD-20260101-0044',
  buyerId: 30,
  createdAt: '2026-01-01T10:00:00',
  total: 250,
  status: 'Processing',
  paymentStatus: 'PAID',
  shippingMethod: 'standard',
  shippingAddress: '123 Card St, Bangkok',
  recipientName: 'Somchai',
  recipientPhone: '0812345678',
  trackingNumber: null,
  items: [{ productId: 31, name: 'Charizard VMAX', game: 'Pokemon', imageUrl: null, price: 100, quantity: 2, storeName: 'Independent TCG' }],
  storeName: 'Independent TCG',
  shippingFee: 50,
  subtotal: 200,
  discountCode: null,
  discountName: null,
  discountAmount: 0,
};

const renderPage = (path = '/orders-management/44') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/orders-management/:orderId" element={<SellerOrderDetail />} />
      <Route path="/orders-management" element={<p>Orders list</p>} />
    </Routes>
  </MemoryRouter>,
);

describe('SellerOrderDetail', () => {
  beforeEach(() => {
    loadSellerOrder.mockReset();
  });

  it('shows the order summary for the store owner', async () => {
    loadSellerOrder.mockResolvedValue(order);
    renderPage();

    expect(await screen.findByText('Order #ORD-20260101-0044')).toBeInTheDocument();
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText('Net total')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ Save as PDF/i })).toBeInTheDocument();
    expect(loadSellerOrder).toHaveBeenCalledWith(44);
  });

  it('shows the recipient and delivery address', async () => {
    loadSellerOrder.mockResolvedValue(order);
    renderPage();

    await screen.findByText('Order #ORD-20260101-0044');

    expect(screen.getAllByText('123 Card St, Bangkok').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Somchai').length).toBeGreaterThanOrEqual(1);
  });

  it('shows store pickup when an order has no delivery address', async () => {
    loadSellerOrder.mockResolvedValue({ ...order, shippingMethod: 'pickup', shippingAddress: null, recipientName: null, recipientPhone: null });
    renderPage();

    await screen.findByText('Order #ORD-20260101-0044');

    expect(screen.getAllByText('Store pickup').length).toBeGreaterThanOrEqual(1);
  });

  it('shows an error when the order cannot be loaded', async () => {
    loadSellerOrder.mockRejectedValue(new Error('Order not found'));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Order not found');
  });

  it('rejects an invalid order id without calling the server', async () => {
    renderPage('/orders-management/abc');

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid order ID.');
    expect(loadSellerOrder).not.toHaveBeenCalled();
  });

  it('goes back to the orders list', async () => {
    loadSellerOrder.mockResolvedValue(order);
    renderPage();
    await screen.findByText('Order #ORD-20260101-0044');

    await userEvent.click(screen.getByRole('button', { name: /Back to orders/i }));

    expect(screen.getByText('Orders list')).toBeInTheDocument();
  });
});

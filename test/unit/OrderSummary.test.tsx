import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderSummary, paymentStatusLabel, type OrderSummaryData } from '../../src/components/OrderSummary';

const baseOrder: OrderSummaryData = {
  orderNumber: 'ORD-20260101-0001',
  placedAt: '01 Jan 2026, 10:00',
  storeName: 'Optracard Official Store',
  status: 'Processing',
  paymentStatus: 'PAID',
  items: [
    { key: '1', name: 'Charizard VMAX', game: 'Pokemon', price: 4500, quantity: 2 },
    { key: '2', name: 'Card Sleeves', game: 'Accessories', price: 150, quantity: 1 },
  ],
  subtotal: 9150,
  discountAmount: 0,
  shippingFee: 50,
  total: 9200,
  address: ['Somchai', '123 Card St, Bangkok', '0812345678'],
};

afterEach(() => vi.restoreAllMocks());

describe('OrderSummary', () => {
  it('shows the order number, items, shipping, net total and payment status', () => {
    render(<OrderSummary order={baseOrder} />);

    expect(screen.getByText('Order #ORD-20260101-0001')).toBeInTheDocument();
    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getByText('Card Sleeves')).toBeInTheDocument();
    expect(screen.getByText('Items subtotal')).toBeInTheDocument();
    expect(screen.getByText('Shipping fee')).toBeInTheDocument();
    expect(screen.getByText('Net total')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('prints the delivery address', () => {
    render(<OrderSummary order={baseOrder} />);

    expect(screen.getByText('123 Card St, Bangkok')).toBeInTheDocument();
  });

  it('hides the discount row when no discount was applied', () => {
    render(<OrderSummary order={baseOrder} />);

    expect(screen.queryByText(/^Discount/)).not.toBeInTheDocument();
  });

  it('shows the discount code, name and amount when a discount was applied', () => {
    render(<OrderSummary order={{ ...baseOrder, discountCode: 'SAVE10', discountName: 'Autumn sale', discountAmount: 915, total: 8285 }} />);

    expect(screen.getByText('Discount · Autumn sale (SAVE10)')).toBeInTheDocument();
    expect(screen.getByText(/−.*915/)).toBeInTheDocument();
  });

  it('shows free shipping when the fee is zero', () => {
    render(<OrderSummary order={{ ...baseOrder, shippingFee: 0, total: 9150 }} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('opens the print dialog from the Print / Save as PDF button', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    render(<OrderSummary order={baseOrder} />);

    await userEvent.click(screen.getByRole('button', { name: /Print \/ Save as PDF/i }));

    expect(print).toHaveBeenCalledTimes(1);
  });

  it('labels unknown payment status clearly', () => {
    expect(paymentStatusLabel(null)).toBe('Not recorded');
    expect(paymentStatusLabel('PENDING')).toBe('Pending');
  });
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutModal } from '../../src/components/CheckoutModal';

const savedAddress = { name: 'Kendo', phone: '0812345678', address: 'Bangkok' };
const officialSeller = [{ key: 'official', storeName: 'Optracard Official Store', source: 'OFFICIAL' as const, itemCount: 1 }];

describe('CheckoutModal', () => {
  it('allows pickup without an address and sends the selected payment method', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<CheckoutModal isOpen subtotal={500} sellerGroups={officialSeller} savedAddress={{ name: '', phone: '', address: '' }} onClose={vi.fn()} onConfirm={onConfirm} />);

    expect(screen.getByText(/No address needed/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /QR Payment/i }));
    await user.click(screen.getByRole('button', { name: /Confirm Order/i }));

    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      shippingMethod: 'pickup',
      paymentMethod: 'qr',
      shippingAddress: 'Store Counter Pickup',
    }));
  });

  it('requires a complete delivery address before standard delivery can be confirmed', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<CheckoutModal isOpen subtotal={500} sellerGroups={officialSeller} savedAddress={{ name: '', phone: '', address: '' }} onClose={vi.fn()} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: /Standard Delivery/i }));
    const confirm = screen.getByRole('button', { name: /Confirm Order/i });
    expect(confirm).toBeDisabled();
    await user.type(screen.getByPlaceholderText('Recipient Name'), 'Kendo');
    await user.type(screen.getByPlaceholderText('Phone Number'), '0812345678');
    await user.type(screen.getByPlaceholderText('Full Address'), 'Bangkok');
    expect(confirm).toBeEnabled();

    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
      shippingMethod: 'standard',
      recipientName: 'Kendo',
      recipientPhone: '0812345678',
      shippingAddress: 'Bangkok',
    }));
  });

  it('requires delivery for multi-seller carts and multiplies the shipping fee', () => {
    render(<CheckoutModal isOpen subtotal={500} sellerGroups={[
      ...officialSeller,
      { key: 'marketplace', storeName: 'Moonlight TCG', source: 'MARKETPLACE', itemCount: 2 },
    ]} savedAddress={savedAddress} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Store Pickup/i })).toBeDisabled();
    expect(screen.getByText('Shipping Fee (2 sellers)')).toBeInTheDocument();
    expect(screen.getAllByText('฿100.00').length).toBeGreaterThan(0);
  });

  it('prevents duplicate confirmation while an order request is pending', () => {
    render(<CheckoutModal isOpen subtotal={500} sellerGroups={officialSeller} savedAddress={savedAddress} isOrdering onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Placing Order…' })).toBeDisabled();
  });
});

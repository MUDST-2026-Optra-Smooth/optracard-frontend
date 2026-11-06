import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ADpromotions } from '../../src/pages/AD_promotions';
import * as adminApi from '../../src/api/admin';

vi.mock('../../src/api/admin', () => ({
  loadAdminPromotions: vi.fn(),
  createAdminPromotion: vi.fn(),
  updateAdminPromotion: vi.fn(),
  deleteAdminPromotion: vi.fn(),
}));

vi.mock('../../src/components/AdminWorkspace', () => ({
  AdminWorkspace: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  AdminLoading: ({ label }: { label: string }) => <p>{label}</p>,
  AdminError: ({ message }: { message: string }) => <p role="alert">{message}</p>,
  formatCurrency: (value: number) => `฿${value.toFixed(2)}`,
  formatDate: (value: string) => value,
  StatusBadge: ({ status }: { status: string }) => <span>{status}</span>,
}));

const savedPromotion = {
  id: 1,
  code: 'HALF50',
  name: 'Half price',
  discountType: 'PERCENTAGE' as const,
  discountValue: 50,
  maximumDiscountAmount: 100,
  minimumOrderAmount: 500,
  usageLimit: 25,
  perUserLimit: 1,
  usageCount: 0,
  startsAt: '2026-01-01T00:00:00',
  endsAt: '2026-12-31T00:00:00',
  active: true,
};

describe('admin promotion form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApi.loadAdminPromotions).mockResolvedValue([]);
    vi.mocked(adminApi.createAdminPromotion).mockResolvedValue(savedPromotion);
    window.scrollTo = vi.fn();
  });

  it('shows a cap only for percentage promotions', async () => {
    const user = userEvent.setup();
    render(<ADpromotions />);

    expect(await screen.findByLabelText(/Maximum discount/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Discount type'), 'FIXED_AMOUNT');
    expect(screen.queryByLabelText(/Maximum discount/i)).not.toBeInTheDocument();
  });

  it('normalizes a percentage promotion payload with a cap, minimum order, and per-customer limit', async () => {
    const user = userEvent.setup();
    render(<ADpromotions />);
    await screen.findByText('No promotions yet. Create your first discount code above.');

    await user.type(screen.getByLabelText('Code'), 'half50');
    await user.type(screen.getByLabelText('Promotion name'), 'Half price');
    await user.clear(screen.getByLabelText('Percent'));
    await user.type(screen.getByLabelText('Percent'), '50');
    await user.type(screen.getByLabelText(/Maximum discount/i), '100');
    await user.clear(screen.getByLabelText(/Minimum order/i));
    await user.type(screen.getByLabelText(/Minimum order/i), '500');
    await user.type(screen.getByLabelText(/Usage limit/i), '25');
    await user.type(screen.getByLabelText(/Uses per customer/i), '1');
    await user.click(screen.getByRole('button', { name: 'Create promotion' }));

    expect(adminApi.createAdminPromotion).toHaveBeenCalledWith(expect.objectContaining({
      code: 'HALF50',
      name: 'Half price',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maximumDiscountAmount: 100,
      minimumOrderAmount: 500,
      usageLimit: 25,
      perUserLimit: 1,
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('Promotion created.');
  });

  it('clears a percentage cap from the payload when the discount becomes fixed amount', async () => {
    const user = userEvent.setup();
    render(<ADpromotions />);
    await screen.findByText('No promotions yet. Create your first discount code above.');

    await user.type(screen.getByLabelText('Code'), 'flat50');
    await user.type(screen.getByLabelText('Promotion name'), 'Flat price');
    await user.selectOptions(screen.getByLabelText('Discount type'), 'FIXED_AMOUNT');
    await user.clear(screen.getByLabelText('Amount (฿)'));
    await user.type(screen.getByLabelText('Amount (฿)'), '50');
    await user.click(screen.getByRole('button', { name: 'Create promotion' }));

    expect(adminApi.createAdminPromotion).toHaveBeenCalledWith(expect.objectContaining({
      discountType: 'FIXED_AMOUNT',
      maximumDiscountAmount: null,
    }));
  });
});

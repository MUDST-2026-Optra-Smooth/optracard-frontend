import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReorderSuccessToast } from '../../src/components/ReorderSuccessToast';

describe('ReorderSuccessToast', () => {
  it('floats a green cart confirmation with the quantity added from the order', () => {
    render(
      <MemoryRouter>
        <ReorderSuccessToast
          result={{ orderNumber: 'ORD-1', addedCount: 1, skippedCount: 0, skipped: [], added: [{ productId: 1, name: 'Card', requestedQuantity: 3, addedQuantity: 3, reason: null, message: null }] }}
          onDismiss={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status', { name: 'Cart updated' })).toHaveClass('fixed', 'bg-emerald-50');
    expect(screen.getByText('3 items from order #ORD-1 are now in your cart.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review cart' })).toHaveAttribute('href', '/cart');
  });

  it('can be dismissed before it closes itself', async () => {
    const onDismiss = vi.fn();
    render(
      <MemoryRouter>
        <ReorderSuccessToast
          result={{ orderNumber: 'ORD-1', addedCount: 1, skippedCount: 0, skipped: [], added: [{ productId: 1, name: 'Card', requestedQuantity: 1, addedQuantity: 1, reason: null, message: null }] }}
          onDismiss={onDismiss}
        />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss cart update' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});

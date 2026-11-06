import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ReorderResultPanel } from '../../src/components/ReorderResultPanel';
import type { ReorderResult } from '../../src/api/orders';

const line = (productId: number, name: string, extra: Partial<ReorderResult['added'][number]> = {}) => ({
  productId, name, requestedQuantity: 1, addedQuantity: 1, reason: null, message: null, ...extra,
});

const renderPanel = (result: ReorderResult, onDismiss = vi.fn()) =>
  render(<MemoryRouter><ReorderResultPanel result={result} onDismiss={onDismiss} /></MemoryRouter>);

describe('ReorderResultPanel', () => {
  it('confirms a full reorder and links to the cart', () => {
    renderPanel({ orderNumber: 'ORD-1', addedCount: 2, skippedCount: 0, added: [line(1, 'A'), line(2, 'B')], skipped: [] });

    expect(screen.getByText('2 items from order #ORD-1 added to your cart.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to cart' })).toHaveAttribute('href', '/cart');
  });

  it('lists every skipped and limited item with its reason', () => {
    renderPanel({
      orderNumber: 'ORD-1', addedCount: 2, skippedCount: 2,
      added: [line(1, 'A'), line(2, 'B', { requestedQuantity: 3, addedQuantity: 1, reason: 'LIMITED_STOCK', message: 'Only 1 of 3 B could be added because of limited stock.' })],
      skipped: [
        line(3, 'C', { addedQuantity: 0, reason: 'OUT_OF_STOCK', message: 'C is out of stock.' }),
        line(4, 'D', { addedQuantity: 0, reason: 'UNAVAILABLE', message: 'D is no longer available.' }),
      ],
    });

    expect(screen.getByText('Only 1 of 3 B could be added because of limited stock.')).toBeInTheDocument();
    expect(screen.getByText('C is out of stock.')).toBeInTheDocument();
    expect(screen.getByText('D is no longer available.')).toBeInTheDocument();
  });

  it('says plainly when nothing could be added and offers no cart link', () => {
    renderPanel({
      orderNumber: 'ORD-1', addedCount: 0, skippedCount: 1, added: [],
      skipped: [line(3, 'C', { addedQuantity: 0, reason: 'UNAVAILABLE', message: 'C is no longer available.' })],
    });

    expect(screen.getByText('Nothing from order #ORD-1 could be added to your cart.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Go to cart' })).not.toBeInTheDocument();
  });

  it('can be dismissed', async () => {
    const onDismiss = vi.fn();
    renderPanel({ orderNumber: 'ORD-1', addedCount: 1, skippedCount: 0, added: [line(1, 'A')], skipped: [] }, onDismiss);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss reorder result' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

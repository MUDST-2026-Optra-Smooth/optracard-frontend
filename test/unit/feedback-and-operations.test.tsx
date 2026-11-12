import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CartFeedbackToast } from '../../src/components/CartFeedbackToast';
import { ReorderErrorToast } from '../../src/components/ReorderErrorToast';
import { loadOrderNotifications, markOrderNotificationsRead } from '../../src/api/notifications';
import { loadStockAlerts, updateStockAlertSettings } from '../../src/api/stockAlerts';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});

describe('buyer feedback and operational API clients', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('announces cart success/error feedback and lets the buyer dismiss it', () => {
    render(<CartFeedbackToast />);
    act(() => window.dispatchEvent(new CustomEvent('cart-feedback', { detail: { tone: 'success', message: 'Pikachu is in your cart.' } })));
    expect(screen.getByRole('status')).toHaveTextContent('Added to cart');
    expect(screen.getByRole('status')).toHaveTextContent('Pikachu is in your cart.');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss message' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => window.dispatchEvent(new CustomEvent('cart-feedback', { detail: { tone: 'error', message: 'Only 1 remains.' } })));
    expect(screen.getByRole('alert')).toHaveTextContent('Could not add to cart');
  });

  it('keeps reorder failure accessible and auto-dismisses it after five seconds', () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    render(<ReorderErrorToast message="This item is no longer available" onDismiss={dismiss} />);
    expect(screen.getByRole('alert')).toHaveTextContent('This item is no longer available');
    vi.advanceTimersByTime(5000);
    expect(dismiss).toHaveBeenCalledOnce();
  });

  it('attaches the bearer token to notification and stock-alert mutations', async () => {
    localStorage.setItem('token', 'operator-token');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({}))
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response({ defaultThreshold: 4 }));
    vi.stubGlobal('fetch', fetchMock);

    await loadOrderNotifications();
    await markOrderNotificationsRead();
    await loadStockAlerts();
    await updateStockAlertSettings(4);

    expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/notifications\/read-all$/);
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'PUT' });
    expect(fetchMock.mock.calls[3][0]).toMatch(/\/api\/stock-alerts\/settings$/);
    expect(fetchMock.mock.calls[3][1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ defaultThreshold: 4 }) });
    for (const [, init] of fetchMock.mock.calls) {
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer operator-token');
    }
  });

  it('uses the server error message for failed operational calls', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ message: 'You do not own this alert' }, 403)));
    await expect(loadStockAlerts()).rejects.toThrow('You do not own this alert');
  });
});

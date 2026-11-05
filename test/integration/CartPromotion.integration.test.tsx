import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
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
});

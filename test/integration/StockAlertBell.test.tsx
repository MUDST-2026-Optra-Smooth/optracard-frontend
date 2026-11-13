import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { updateStockAlertSettings as updateAdminThreshold } from '../../src/api/admin';
import { updateStockAlertSettings as updateSellerThreshold } from '../../src/api/stockAlerts';
import { StockAlertBell } from '../../src/components/StockAlertBell';
import { AuthProvider } from '../../src/context/AuthContext';

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe.each([
  { role: 'ADMIN', start: '/admin/dashboard', next: '/admin/stocks', updateThreshold: updateAdminThreshold },
  { role: 'SELLER', start: '/dashboard', next: '/seller', updateThreshold: updateSellerThreshold },
])('$role stock notifications', ({ role, start, next, updateThreshold }) => {
  it('refreshes on entry, navigation and threshold save, then shows every qualifying product', async () => {
    localStorage.setItem('user', JSON.stringify({ username: 'Staff', email: 'staff@example.com', role }));
    localStorage.setItem('token', 'staff-token');
    let threshold = 5;
    const requests: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith('/api/stock-alerts/settings') && init?.method === 'PUT') {
        threshold = JSON.parse(init.body as string).defaultThreshold;
        requests.push('PUT settings');
        return Response.json({ defaultThreshold: threshold });
      }
      expect(url).toMatch(/\/api\/stock-alerts$/);
      expect(init?.cache).toBe('no-store');
      requests.push('GET alerts');
      return Response.json(threshold >= 100 ? Array.from({ length: 12 }, (_, index) => ({
        id: index + 1,
        productId: index + 1,
        productName: `Product ${index + 1}`,
        alertType: 'LOW_STOCK',
        stock: 100,
        threshold,
        listingSource: role === 'ADMIN' ? 'OFFICIAL' : 'MARKETPLACE',
        storeName: 'Card shop',
        activatedAt: null,
        read: false,
      })) : []);
    }));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={[start]}>
          <Link to={next}>Open inventory</Link>
          <button type="button" onClick={() => void updateThreshold(102)}>Save threshold</button>
          <StockAlertBell />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Stock alerts' }));
    await screen.findByText('No low-stock or out-of-stock products.');
    fireEvent.click(screen.getByRole('link', { name: 'Open inventory' }));
    await waitFor(() => expect(requests).toEqual(['GET alerts', 'GET alerts']));

    fireEvent.click(screen.getByRole('button', { name: 'Save threshold' }));
    expect(await screen.findByText('Product 12')).toBeInTheDocument();
    expect(screen.getAllByText(/100 left · threshold 102/)).toHaveLength(12);
    expect(requests).toEqual(['GET alerts', 'GET alerts', 'PUT settings', 'GET alerts']);
  });
});

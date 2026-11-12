import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminWeeklyReport } from '../../src/components/AdminWeeklyReport';

vi.hoisted(() => vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example.test'));

vi.mock('../../src/components/ADsidebar', () => ({ ADsidebar: () => null }));

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); localStorage.clear(); });

describe('Admin weekly report', () => {
  it('loads database report through configured API host with authentication', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://backend.example.test');
    localStorage.setItem('token', 'admin-session');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      revenue: 1234, cost: 234, profit: 1000, totalOrders: 2, itemsSold: 3,
      topProducts: [{ productId: 1, name: 'Report test card', quantitySold: 3,
        totalRevenue: 1234, currentStock: 10, daysUntilOut: 20,
        recommendedRestock: 6, status: 'Normal' }],
    }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<AdminWeeklyReport />);
    expect(await screen.findByText('Report test card')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('https://backend.example.test/api/admin/reports/weekly?startDate='),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer admin-session' }) }));
  });

  it('shows database failures instead of displaying an empty successful report', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503,
      json: async () => ({ message: 'Unable to load weekly report' }) }));
    render(<AdminWeeklyReport />);
    expect(await screen.findByText('Unable to load weekly report')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export csv/i })).toBeDisabled();
  });
});

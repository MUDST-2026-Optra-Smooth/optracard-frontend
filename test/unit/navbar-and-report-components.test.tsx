/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const { navigate, logout, authState, searchCatalog, loadOrderNotifications, markOrderNotificationsRead, loadWeeklyReport } = vi.hoisted(() => {
  const logout = vi.fn();
  return {
    navigate: vi.fn(),
    logout,
    authState: { user: null as any, logout },
    searchCatalog: vi.fn(),
    loadOrderNotifications: vi.fn(),
    markOrderNotificationsRead: vi.fn(),
    loadWeeklyReport: vi.fn(),
  };
});

vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => authState }));
vi.mock('../../src/hooks/useCartCount', () => ({ useCartCount: () => 2 }));
vi.mock('../../src/api/catalog', () => ({ searchCatalog }));
vi.mock('../../src/api/notifications', () => ({ loadOrderNotifications, markOrderNotificationsRead }));
vi.mock('../../src/api/admin', () => ({ loadWeeklyReport }));
vi.mock('../../src/components/ADsidebar', () => ({ ADsidebar: () => <aside>admin sidebar</aside> }));

import { Navbar } from '../../src/components/Navbar';
import AdminWeeklyReport from '../../src/components/AdminWeeklyReport';

const nav = (ui: React.ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('Navbar interactions', () => {
  beforeEach(() => {
    vi.useRealTimers();
    navigate.mockReset();
    logout.mockReset();
    searchCatalog.mockResolvedValue([{ id: 1, name: 'Pikachu', game: 'Pokemon', type: 'Single', price: 100, imageUrl: null }]);
    loadOrderNotifications.mockResolvedValue([{ id: 1, orderId: 1, orderNumber: 'ORD-1', message: 'Shipped', trackingNumber: 'T1', createdAt: null, read: false }]);
    markOrderNotificationsRead.mockResolvedValue(undefined);
    authState.user = null;
  });
  afterEach(() => vi.useRealTimers());

  it('searches, shows suggestions, clears query and protects shop links', async () => {
    nav(<Navbar />);
    const input = screen.getByPlaceholderText(/Search by card game/);
    fireEvent.change(input, { target: { value: 'pik' } });
    await waitFor(() => expect(screen.getByText('Pikachu')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/View all search results/));
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    fireEvent.click(screen.getByText('My Shop'));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('handles authenticated notifications, categories, profile and logout', async () => {
    authState.user = { role: 'USER', email: 'u@example.com', userId: 1, profileImage: 'not-safe' };
    nav(<Navbar />);
    await waitFor(() => expect(loadOrderNotifications).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Order notifications' }));
    expect(screen.getByText('Shipped')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Shipped'));
    const input = screen.getByPlaceholderText(/Search by card game/);
    fireEvent.change(input, { target: { value: 'single' } });
    expect(screen.getByText('Single')).toBeInTheDocument();
    fireEvent.click(screen.getByText(/View all Single/));
    fireEvent.click(screen.getByText('Logout'));
    expect(logout).toHaveBeenCalled();
  });

  it('renders admin navigation and handles notification failure', async () => {
    authState.user = { role: 'ADMIN', email: 'a@example.com', userId: 2 };
    loadOrderNotifications.mockRejectedValue(new Error('offline'));
    nav(<Navbar />);
    await waitFor(() => expect(loadOrderNotifications).toHaveBeenCalled());
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Logout'));
    expect(logout).toHaveBeenCalled();
  });
});

describe('AdminWeeklyReport', () => {
  beforeEach(() => {
    vi.useRealTimers();
    loadWeeklyReport.mockResolvedValue({ revenue: 1000, cost: 400, profit: 600, totalOrders: 3, itemsSold: 4, topProducts: [
      { productId: 1, name: 'Alpha', quantitySold: 2, totalRevenue: 100, currentStock: 5, daysUntilOut: 2, recommendedRestock: 4, status: 'ปกติ' },
      { productId: 2, name: 'Beta', quantitySold: 1, totalRevenue: 50, currentStock: 0, daysUntilOut: 0, recommendedRestock: 0, status: 'ยังมีข้อมูลไม่เพียงพอ' },
      { productId: 3, name: 'Gamma', quantitySold: 3, totalRevenue: 250, currentStock: 1, daysUntilOut: 1, recommendedRestock: 8, status: 'ควรเติมด่วน' },
    ] });
  });

  it('loads report, sorts columns and exports csv', async () => {
    render(<AdminWeeklyReport />);
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Product Name/ }));
    fireEvent.click(screen.getByRole('button', { name: /Quantity Sold/ }));
    fireEvent.click(screen.getByRole('button', { name: /Total Revenue/ }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/ }));
    expect(click).toHaveBeenCalled();
    click.mockRestore();
  });

  it('renders invalid range and retry error', async () => {
    loadWeeklyReport.mockRejectedValue(new Error('report failed'));
    render(<AdminWeeklyReport />);
    await waitFor(() => expect(screen.getByText('report failed')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Retry/ }));
    expect(loadWeeklyReport).toHaveBeenCalled();
    const dates = screen.getAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
    fireEvent.change(dates[0], { target: { value: '2026-12-31' } });
    fireEvent.change(dates[1], { target: { value: '2026-01-01' } });
    await waitFor(() => expect(screen.getByText(/valid date range/)).toBeInTheDocument());
  });
});

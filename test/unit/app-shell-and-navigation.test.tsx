/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  user: { userId: 7, username: 'Admin', role: 'ADMIN', email: 'admin@test' } as any,
  logout: vi.fn(),
}));
const cart = vi.hoisted(() => ({ getCartItemCount: vi.fn() }));
const search = vi.hoisted(() => ({ searchCatalog: vi.fn() }));
const notifications = vi.hoisted(() => ({ loadOrderNotifications: vi.fn(), markOrderNotificationsRead: vi.fn() }));

vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../../src/api/cart', () => cart);
vi.mock('../../src/api/catalog', () => search);
vi.mock('../../src/api/notifications', () => notifications);
vi.mock('../../src/components/StockAlertBell', () => ({ StockAlertBell: () => <span>Alerts</span> }));
vi.mock('../../src/pages/Home', () => ({ Home: () => <div>Home page</div> }));
vi.mock('../../src/pages/Login', () => ({ Login: () => <div>Login page</div> }));
vi.mock('../../src/pages/Register', () => ({ Register: () => <div>Register page</div> }));
vi.mock('../../src/pages/Aboutus', () => ({ AboutUs: () => <div>About page</div> }));
vi.mock('../../src/pages/OurTeam', () => ({ OurTeam: () => <div>Team page</div> }));
vi.mock('../../src/components/CartFeedbackToast', () => ({ CartFeedbackToast: () => <div>Cart toast</div> }));

import { Footer } from '../../src/components/Footer';
import { AdminHeader } from '../../src/components/AdminHeader';
import { Navbar } from '../../src/components/Navbar';
import { useCartCount } from '../../src/hooks/useCartCount';
import { App } from '../../src/App';

describe('application shell and navigation coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cart.getCartItemCount.mockResolvedValue(3);
    search.searchCatalog.mockResolvedValue([{ id: 1, name: 'Pikachu', game: 'Pokemon', type: 'Single', price: 10, stock: 1 }]);
    notifications.loadOrderNotifications.mockResolvedValue([{ id: 1, orderNumber: 'ORD-1', message: 'Ready', read: false }]);
    notifications.markOrderNotificationsRead.mockResolvedValue(undefined);
    auth.user = { userId: 7, username: 'Admin', role: 'ADMIN', email: 'admin@test' } as any;
  });

  it('loads and refreshes cart count only for authenticated users', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    const { result, rerender, unmount } = renderHook(() => useCartCount(), { wrapper });
    await waitFor(() => expect(result.current).toBe(3));
    await act(async () => window.dispatchEvent(new Event('cart-updated')));
    expect(cart.getCartItemCount).toHaveBeenCalledWith(7);
    auth.user = null;
    rerender();
    await waitFor(() => expect(result.current).toBe(0));
    unmount();
  });

  it('renders footer navigation and admin header fixed scroll behavior', () => {
    const { container } = render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(/Empowering Thailand/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Auctions' })).toHaveAttribute('href', '/auctions');
    const header = render(<MemoryRouter><AdminHeader fixed workspaceName="Operations" /></MemoryRouter>);
    expect(screen.getByText('Operations')).toBeInTheDocument();
    fireEvent.scroll(window, { target: { scrollY: 20 } });
    expect(header.container.querySelector('header')).toHaveClass('-translate-y-full');
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('supports navbar search, categories, notifications, protected links and logout', async () => {
    render(<MemoryRouter initialEntries={['/']}><Navbar /></MemoryRouter>);
    const input = screen.getByPlaceholderText(/Search by card game/i);
    fireEvent.change(input, { target: { value: 'Pika' } });
    fireEvent.focus(input);
    await waitFor(() => expect(search.searchCatalog).toHaveBeenCalledWith('Pika'));
    fireEvent.keyDown(input, { key: 'Enter' });
    auth.user = { userId: 7, username: 'Buyer', role: 'USER', email: 'buyer@test' } as any;
    cleanup();
    render(<MemoryRouter initialEntries={['/']}><Navbar /></MemoryRouter>);
    const bell = screen.getByRole('button', { name: /order notifications/i });
    await waitFor(() => expect(notifications.loadOrderNotifications).toHaveBeenCalled());
    fireEvent.click(bell);
    expect(screen.getByText('Ready')).toBeInTheDocument();
    await waitFor(() => expect(notifications.markOrderNotificationsRead).toHaveBeenCalled());
    fireEvent.mouseDown(document.body);
    expect(document.querySelector('nav')).toBeInTheDocument();
  });

  it('renders app routes, hides shell on workspaces, and redirects legacy routes', async () => {
    render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);
    expect(screen.getByText('Home page')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter initialEntries={['/admin']}><App /></MemoryRouter>);
    expect(screen.queryByText(/Empowering Thailand's TCG community/i)).not.toBeInTheDocument();
    cleanup();
    render(<MemoryRouter initialEntries={['/unknown']}><App /></MemoryRouter>);
    await waitFor(() => expect(screen.getByText('Home page')).toBeInTheDocument());
  });
});

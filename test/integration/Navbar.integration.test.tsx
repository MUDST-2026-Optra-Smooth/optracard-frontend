import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from '../../src/components/Navbar';
import * as AuthContextModule from '../../src/context/AuthContext';
import * as CartHookModule from '../../src/hooks/useCartCount';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../src/hooks/useCartCount', () => ({
  useCartCount: vi.fn(),
}));

vi.mock('../../src/api/catalog', () => ({
  loadCatalog: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../src/api/notifications', () => ({
  loadOrderNotifications: vi.fn().mockResolvedValue([]),
  markOrderNotificationsRead: vi.fn().mockResolvedValue(undefined),
}));

describe('Navbar Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders guest navigation with Login button and public links', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      logout: vi.fn(),
      login: vi.fn(),
    });
    vi.mocked(CartHookModule.useCartCount).mockReturnValue(0);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about us/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /our team/i })).toBeInTheDocument();
  });

  it('renders customer navigation with cart count badge and user profile', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { userId: 1, email: 'buyer@test.com', username: 'Ash Ketchum', role: 'USER' },
      token: 'jwt-token',
      logout: vi.fn(),
      login: vi.fn(),
    });
    vi.mocked(CartHookModule.useCartCount).mockReturnValue(3);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /order notifications/i })).toBeInTheDocument();
  });

  it('renders cart icon and dashboard link for ADMIN users', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { userId: 99, email: 'admin@optracard.com', username: 'Chief Admin', role: 'ADMIN' },
      token: 'jwt-token',
      logout: vi.fn(),
      login: vi.fn(),
    });
    vi.mocked(CartHookModule.useCartCount).mockReturnValue(2);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Verify Admin Dashboard link points to /admin/dashboard
    const dashboardLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/admin/dashboard');

    // Verify Cart link is present with item badge for Admin
    const cartLink = screen.getByRole('link', { name: /shopping cart/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders cart icon and superadmin dashboard link for SUPER_ADMIN users', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { userId: 100, email: 'super@optracard.com', username: 'Root', role: 'SUPER_ADMIN' },
      token: 'jwt-token',
      logout: vi.fn(),
      login: vi.fn(),
    });
    vi.mocked(CartHookModule.useCartCount).mockReturnValue(5);

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Verify SuperAdmin Dashboard link points to /superadmin/overview
    const dashboardLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/superadmin/overview');

    // Verify Cart link is present with item badge for Super Admin
    const cartLink = screen.getByRole('link', { name: /shopping cart/i });
    expect(cartLink).toBeInTheDocument();
    expect(cartLink).toHaveAttribute('href', '/cart');
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});


import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import * as AuthContextModule from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', async () => {
  const actual = await vi.importActual<typeof AuthContextModule>('../../src/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

describe('ProtectedRoute unit tests', () => {
  it('renders children when user is authenticated with permitted role', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { userId: 1, email: 'admin@test.com', username: 'admin', role: 'ADMIN' },
      token: 'jwt-token',
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <div>Secret Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Secret Admin Dashboard')).toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Secret Content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects user when role is not allowed', () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { userId: 2, email: 'user@test.com', username: 'buyer', role: 'USER' },
      token: 'jwt-token',
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/superadmin/overview']}>
        <Routes>
          <Route
            path="/superadmin/overview"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <div>Superadmin Secret</div>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Superadmin Secret')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});


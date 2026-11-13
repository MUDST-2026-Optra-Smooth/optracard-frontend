/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../../src/pages/Login';
import * as AuthContextModule from '../../src/context/AuthContext';

const mockNavigate = vi.fn();
const locationState = { current: null as any };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: locationState.current }),
  };
});

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Page Integration Tests', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    locationState.current = null;
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      token: null,
      logout: vi.fn(),
      login: mockLogin,
    });
    vi.stubGlobal('alert', vi.fn());
  });

  it('renders login form with email, password fields and submit button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /welcome to optracard/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('submits form successfully and invokes login context on 200 response', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          userId: 10,
          username: 'tester',
          email: 'tester@example.com',
          role: 'USER',
          profileImage: null,
          token: 'jwt-auth-sample-token',
        }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /login/i });

    await user.type(emailInput, 'tester@example.com');
    await user.type(passwordInput, 'Secret123!');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        {
          userId: 10,
          username: 'tester',
          email: 'tester@example.com',
          role: 'USER',
          profileImage: null,
        },
        'jwt-auth-sample-token'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays alert notification on invalid credentials', async () => {
    const user = userEvent.setup();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Invalid email or password',
        }),
      })
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid email or password');
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('routes sellers to the storefront and shows a reconnect error', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ userId: 2, username: 'seller', email: 'seller@test', role: 'SELLER', token: 'token' }) }));
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.type(screen.getByLabelText(/email/i), 'seller@test');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true }));

    cleanup();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.type(screen.getByLabelText(/email/i), 'seller@test');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Cannot connect to backend server'));
  });

  it('uses role home for admin and displays a navigation message', async () => {
    const user = userEvent.setup();
    locationState.current = { message: 'Please sign in', from: { pathname: '/seller/orders' } };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ userId: 1, username: 'admin', email: 'admin@test', role: 'ADMIN', token: 'token' }) }));
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByRole('status')).toHaveTextContent('Please sign in');
    await user.type(screen.getByLabelText(/email/i), 'admin@test');
    await user.type(screen.getByLabelText(/password/i), 'password');
    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'));
  });
});

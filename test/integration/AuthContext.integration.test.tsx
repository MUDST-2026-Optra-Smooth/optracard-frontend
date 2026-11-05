import { afterEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

const SessionControls = () => {
  const { user, login, logout } = useAuth();
  return (
    <>
      <p data-testid="session">{user ? `${user.username}:${user.role}` : 'guest'}</p>
      <button type="button" onClick={() => login({ userId: 7, username: 'Kendo', email: 'kendo@example.com', role: 'SELLER' }, 'new-token')}>Login</button>
      <button type="button" onClick={logout}>Logout</button>
    </>
  );
};

describe('AuthProvider session lifecycle', () => {
  afterEach(() => localStorage.clear());

  it('restores a persisted role only when both the user and token are present', () => {
    localStorage.setItem('token', 'persisted-token');
    localStorage.setItem('user', JSON.stringify({ userId: 8, username: 'Admin', email: 'admin@example.com', role: 'ADMIN' }));

    render(<AuthProvider><SessionControls /></AuthProvider>);

    expect(screen.getByTestId('session')).toHaveTextContent('Admin:ADMIN');
  });

  it('clears a malformed stored session instead of leaving the app in a broken auth state', () => {
    localStorage.setItem('token', 'bad-token');
    localStorage.setItem('user', '{not-json');

    render(<AuthProvider><SessionControls /></AuthProvider>);

    expect(screen.getByTestId('session')).toHaveTextContent('guest');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('persists login and removes every session value on logout', async () => {
    const user = userEvent.setup();
    render(<AuthProvider><SessionControls /></AuthProvider>);

    await user.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByTestId('session')).toHaveTextContent('Kendo:SELLER');
    expect(localStorage.getItem('token')).toBe('new-token');
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toMatchObject({ role: 'SELLER', userId: 7 });

    await user.click(screen.getByRole('button', { name: 'Logout' }));
    expect(screen.getByTestId('session')).toHaveTextContent('guest');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

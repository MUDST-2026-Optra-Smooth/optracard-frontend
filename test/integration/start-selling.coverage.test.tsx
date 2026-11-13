import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { StartSelling } from '../../src/pages/StartSelling';

const navigate = vi.fn();
const auth = vi.hoisted(() => ({ user: { userId: 1, role: 'USER' }, logout: vi.fn() }));
vi.mock('../../src/context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigate };
});

describe('seller application form', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'seller-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => ({}) }));
  });
  afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });

  it('validates each step and submits a complete application', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><StartSelling /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Store Detail' })).toBeInTheDocument();
    fireEvent.submit(document.querySelector('form')!);
    expect(screen.getByRole('status')).toHaveTextContent(/complete all required/i);
    await user.type(screen.getByPlaceholderText('Enter Store Name'), 'My Shop');
    await user.type(screen.getByPlaceholderText('Enter Detail / Store Description'), 'Cards');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'First');
    await user.type(screen.getByRole('textbox', { name: 'Surname' }), 'Last');
    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'seller@test');
    await user.type(screen.getByRole('textbox', { name: 'Tel.' }), '0800000000');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByRole('textbox', { name: 'Bank' }), 'Bank');
    await user.type(screen.getByRole('textbox', { name: 'Branch' }), 'Branch');
    await user.type(screen.getByRole('textbox', { name: 'Account Name' }), 'First Last');
    await user.type(screen.getByRole('textbox', { name: 'Account Number' }), '123');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByRole('textbox', { name: 'Address' }), 'Bangkok');
    await user.type(screen.getByRole('textbox', { name: 'Province' }), 'Bangkok');
    await user.type(screen.getByRole('textbox', { name: 'District' }), 'Pathumwan');
    await user.type(screen.getByRole('textbox', { name: 'Sub-district' }), 'Lumphini');
    await user.type(screen.getByRole('textbox', { name: 'Postal Code' }), '10330');
    await user.click(screen.getByRole('button', { name: 'Submit for approval' }));
    expect(screen.getByRole('status')).toHaveTextContent(/accept the Terms/i);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: 'Submit for approval' }));
    expect(await screen.findByRole('status')).toHaveTextContent(/saved/i);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { addProductToCart, getApiErrorMessage, getCartItemCount } from '../../src/api/cart';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

describe('cart API client', () => {
  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('uses a server message when one is supplied and otherwise uses the fallback', () => {
    expect(getApiErrorMessage({ message: 'Only 1 card remains' }, 'Could not add item')).toBe('Only 1 card remains');
    expect(getApiErrorMessage({ detail: 'Promotion has expired' }, 'Could not apply promotion')).toBe('Promotion has expired');
    expect(getApiErrorMessage({ error: 'ignored' }, 'Could not add item')).toBe('Could not add item');
    expect(getApiErrorMessage(null, 'Could not add item')).toBe('Could not add item');
  });

  it('requires an authenticated session before adding a product', async () => {
    await expect(addProductToCart(42)).rejects.toThrow('Please log in to add products to your cart.');
  });

  it('resolves the profile, sends its bearer token, and publishes a cart refresh event', async () => {
    localStorage.setItem('token', 'buyer-token');
    const cartUpdated = vi.fn();
    window.addEventListener('cart-updated', cartUpdated);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ userId: 7 }))
      .mockResolvedValueOnce(response({ items: [{ productId: 42, quantity: 1 }], totalItemCount: 1 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(addProductToCart(42)).resolves.toEqual({
      items: [{ productId: 42, quantity: 1 }],
      totalItemCount: 1,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, expect.stringContaining('/api/profile'), {
      headers: { Authorization: 'Bearer buyer-token' },
    });
    expect(fetchMock).toHaveBeenNthCalledWith(2, expect.stringContaining('/api/cart/add?userId=7&productId=42&quantity=1'), {
      method: 'POST',
      headers: { Authorization: 'Bearer buyer-token' },
    });
    expect(cartUpdated).toHaveBeenCalledTimes(1);
    window.removeEventListener('cart-updated', cartUpdated);
  });

  it('keeps cart-count failures non-fatal and returns zero for an unauthorised profile', async () => {
    localStorage.setItem('token', 'expired-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ message: 'Unauthorized' }, 401)));

    await expect(getCartItemCount()).resolves.toBe(0);
  });
});

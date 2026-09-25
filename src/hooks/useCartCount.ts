import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCartItemCount } from '../api/cart';

export function useCartCount(): number {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const loadCount = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }
      try {
        const count = await getCartItemCount(user.userId);
        if (!cancelled) setCartCount(count);
      } catch {
        /* silent count fetching */
      }
    };

    void loadCount();

    const refresh = () => {
      void loadCount();
    };

    window.addEventListener('cart-updated', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('cart-updated', refresh);
    };
  }, [user]);

  return cartCount;
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../context/formatters';
import {
  CheckoutModal,
  type CheckoutDetails,
  type CheckoutSellerGroup,
  type SavedAddress,
} from '../components/CheckoutModal';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../api/cart';
import { invalidateCatalogCache } from '../api/catalog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

type CartItem = {
  id: number;
  category: string;
  name: string;
  game: string;
  price: number;
  qty: number;
  stock: number;
  imageUrl?: string;
  storeId?: number | null;
  storeName: string;
  source: 'OFFICIAL' | 'MARKETPLACE';
};

type CartResponse = {
  items: Array<{
    productId: number;
    quantity: number;
    name: string;
    game: string;
    category: string;
    price: number;
    stock: number;
    imageUrl?: string;
    storeId?: number | null;
    storeName: string;
    source?: string;
  }>;
  subtotal: number;
  totalItemCount: number;
};

type ProfileData = { userId: number; username: string; email: string; phone?: string; address?: string };
type SellerGroup = CheckoutSellerGroup & { items: CartItem[]; subtotal: number };

export const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userId, setUserId] = useState<number | undefined>(user?.userId);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedAddress, setSavedAddress] = useState<SavedAddress>({ name: user?.username ?? '', phone: '', address: '' });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const applyCart = (data: CartResponse) => {
    setCartItems(data.items.map((item) => ({
      id: item.productId,
      category: item.category || item.game,
      name: item.name,
      game: item.game,
      price: Number(item.price),
      qty: item.quantity,
      stock: item.stock,
      imageUrl: item.imageUrl,
      storeId: item.storeId,
      storeName: item.storeName || 'Optracard Official Store',
      source: item.source === 'MARKETPLACE' ? 'MARKETPLACE' : 'OFFICIAL',
    })));
  };

  useEffect(() => {
    const load = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        let id = user?.userId;
        let profile: ProfileData | null = null;
        if (!id) {
          const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, { headers: authHeaders });
          if (!profileResponse.ok) throw new Error('Could not identify the logged-in user.');
          profile = await profileResponse.json();
          id = profile?.userId;
          setUserId(id);
        }
        if (profile) {
          setSavedAddress({ name: profile.username || '', phone: profile.phone || '', address: profile.address || '' });
        } else {
          const profileResponse = await fetch(`${API_BASE_URL}/api/profile`, { headers: authHeaders });
          if (profileResponse.ok) {
            profile = await profileResponse.json();
            setSavedAddress({ name: profile.username || '', phone: profile.phone || '', address: profile.address || '' });
          }
        }
        if (!id) throw new Error('Could not identify the logged-in user.');
        const response = await fetch(`${API_BASE_URL}/api/cart/${id}`, { headers: authHeaders });
        if (!response.ok) throw new Error('Could not load your cart.');
        applyCart(await response.json());
        setError(null);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : 'Could not load your cart.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [navigate, token, user?.userId]);

  const refresh = async (response: Response) => {
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(getApiErrorMessage(data, 'Cart update failed.'));
    applyCart(data);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQty = async (id: number, delta: number) => {
    if (!userId) return;
    const current = cartItems.find((item) => item.id === id);
    const quantity = (current?.qty ?? 1) + delta;
    try {
      await refresh(await fetch(`${API_BASE_URL}/api/cart/update?userId=${userId}&productId=${id}&quantity=${quantity}`, {
        method: 'PUT', headers: authHeaders,
      }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Cart update failed.');
    }
  };

  const removeItem = async (id: number) => {
    if (!userId) return;
    try {
      await refresh(await fetch(`${API_BASE_URL}/api/cart/remove?userId=${userId}&productId=${id}`, {
        method: 'DELETE', headers: authHeaders,
      }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Cart update failed.');
    }
  };

  const sellerGroups = useMemo<SellerGroup[]>(() => {
    const groups = new Map<string, SellerGroup>();
    cartItems.forEach((item) => {
      const key = item.source === 'MARKETPLACE'
        ? `marketplace:${item.storeId ?? item.storeName}`
        : 'official';
      const group = groups.get(key) ?? {
        key,
        storeName: item.storeName,
        source: item.source,
        itemCount: 0,
        subtotal: 0,
        items: [],
      };
      group.items.push(item);
      group.itemCount += item.qty;
      group.subtotal += item.price * item.qty;
      groups.set(key, group);
    });
    return Array.from(groups.values());
  }, [cartItems]);

  const handleOrderConfirmed = async (details: CheckoutDetails) => {
    setIsOrdering(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(details),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getApiErrorMessage(data, 'Could not place your order.'));

      const orders = Array.isArray(data?.orders) ? data.orders : [];
      const orderNumbers = orders.map((order: { orderNumber?: string }) => order.orderNumber).filter(Boolean);
      const message = orderNumbers.length === 1
        ? `Order ${orderNumbers[0]} was saved successfully.`
        : `Created ${orderNumbers.length} separate orders for ${orderNumbers.join(' and ')}.`;

      invalidateCatalogCache();
      setIsCheckoutOpen(false);
      window.dispatchEvent(new Event('cart-updated'));
      navigate('/order-history', { state: { message } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not place your order.');
    } finally {
      setIsOrdering(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Loading cart…</div>;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={16} />Continue Shopping
        </button>
        {error && <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4"><ShoppingBag size={24} className="text-gray-300" /></div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Add some cards to get started.</p>
            <button type="button" onClick={() => navigate('/')} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm">Browse Cards</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Your Shopping Cart ({totalItemCount} items)</h2>
              <div className="space-y-5">
                {sellerGroups.map((group) => (
                  <section key={group.key} className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between gap-3 bg-gray-50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">{group.storeName}</p>
                        <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide ${group.source === 'MARKETPLACE' ? 'text-orange-600' : 'text-blue-600'}`}>
                          {group.source === 'MARKETPLACE' ? 'Marketplace seller' : 'Optracard Official Store'} · {group.itemCount} item{group.itemCount === 1 ? '' : 's'}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-gray-900">{formatPrice(group.subtotal)}</p>
                    </div>
                    <div className="px-4">
                      {group.items.map((item, index) => (
                        <div key={item.id} className={`flex items-center gap-4 py-4 ${index !== group.items.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" /> : <span>🃏</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase mb-0.5">{item.category}</p>
                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 truncate">{item.game}</p>
                          </div>
                          <div className="w-24 text-right text-sm font-bold text-gray-900 shrink-0">{formatPrice(item.price)}</div>
                          <div className="flex items-center border border-gray-200 rounded-lg h-8 shrink-0">
                            <button type="button" onClick={() => updateQty(item.id, -1)} className="w-8 h-full flex items-center justify-center text-gray-400" aria-label="Decrease quantity"><Minus size={14} /></button>
                            <span className="w-6 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, 1)} className="w-8 h-full flex items-center justify-center text-gray-400" aria-label="Increase quantity"><Plus size={14} /></button>
                          </div>
                          <button type="button" onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500" aria-label="Remove item"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <aside className="lg:sticky lg:top-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              <div className="space-y-2.5 text-sm border-b border-gray-100 pb-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span className="text-gray-400 text-xs">Calculated per seller at checkout</span></div>
              </div>
              <div className="flex justify-between items-center py-4"><span className="text-sm font-bold text-gray-900">Estimated Total</span><span className="text-lg font-bold text-blue-600">{formatPrice(subtotal)}</span></div>
              <button type="button" disabled={isOrdering} onClick={() => setIsCheckoutOpen(true)} className="w-full bg-blue-600 disabled:opacity-50 text-white font-bold py-3 rounded-full text-sm">
                {isOrdering ? 'Processing…' : 'Place Order'}
              </button>
              <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-blue-500">ⓘ</span>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {sellerGroups.length > 1
                    ? `Your cart has ${sellerGroups.length} sellers. Checkout creates one order per seller.`
                    : 'Choose your delivery address, shipping method, and payment method in the next step.'}
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        sellerGroups={sellerGroups}
        savedAddress={savedAddress}
        onConfirm={handleOrderConfirmed}
      />
    </div>
  );
};

export default Cart;

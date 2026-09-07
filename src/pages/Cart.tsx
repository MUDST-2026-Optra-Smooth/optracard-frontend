import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../context/formatters';
import { CheckoutModal, type SavedAddress } from '../components/CheckoutModal';

interface CartItem {
  id: string;
  category: string;
  name: string;
  price: number;
  qty: number;
  imageUrl: string;
}

// TODO: replace with real cart data once the backend/cart API exists
const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: '1',
    category: 'POKEMON',
    name: 'Charizard ex (006/165)',
    price: 280,
    qty: 2,
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/6_hires.png',
  },
  {
    id: '2',
    category: 'BATTLE OF TALINGCHAN',
    name: 'พี่หน่วง พิธีกรผมสวย',
    price: 3000,
    qty: 1,
    imageUrl: '/1111.jpg',
  },
];

// TODO: replace with the logged-in user's saved profile address once that's wired up
const SAVED_ADDRESS: SavedAddress = {
  name: 'Anong Suksawat',
  phone: '089-123-4567',
  address: '88/12 Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand',
};

export const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(INITIAL_CART_ITEMS);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const updateQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  const handleOrderConfirmed = () => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    navigate('/order-history');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </button>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <ShoppingBag size={24} className="text-gray-300" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Your cart is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Add some cards to get started.</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition cursor-pointer"
            >
              Browse Cards
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">
                Your Shopping Cart ({totalItemCount} items)
              </h2>

              <div>
                {cartItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 py-4 ${
                      idx !== cartItems.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold tracking-wide text-gray-400 uppercase mb-0.5">
                        {item.category}
                      </p>
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    </div>

                    <div className="w-24 text-right text-sm font-bold text-gray-900 shrink-0">
                      {formatPrice(item.price)}
                    </div>

                    <div className="flex items-center border border-gray-200 rounded-lg h-8 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-500 transition shrink-0 cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-6 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-2.5 text-sm border-b border-gray-100 pb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-400 text-xs">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <span className="text-sm font-bold text-gray-900">Estimated Total</span>
                <span className="text-lg font-bold text-blue-600">{formatPrice(subtotal)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-sm transition cursor-pointer"
              >
                Place Order
              </button>

              <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-lg p-3">
                <span className="text-blue-500 text-sm leading-none mt-0.5">ⓘ</span>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  You'll choose your delivery address, shipping method, and payment method in the next step.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        subtotal={subtotal}
        savedAddress={SAVED_ADDRESS}
        onConfirm={handleOrderConfirmed}
      />
    </div>
  );
};

export default Cart;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../api/cart';
import { formatPrice } from '../context/formatters';
import { useAuth } from '../context/AuthContext';

interface TradingListingCardProps {
  cardName: string;
  gameName: string;
  itemCount: number;
  startingPrice: number;
  imageUrl?: string;
  storeName?: string;
  source?: 'MARKETPLACE' | 'OFFICIAL';
  productId?: number;
}

const sourceStyle = {
  MARKETPLACE: 'bg-orange-500 text-white',
  OFFICIAL: 'bg-blue-600 text-white',
};

export const TradingListingCard = ({ cardName, gameName, itemCount, startingPrice, imageUrl, storeName, source, productId }: TradingListingCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setImageFailed(false);
    setCartQuantity(0);
    setFeedback(null);
  }, [imageUrl, productId]);

  const handleAddToCart = async () => {
    if (!productId) return;
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (cartQuantity >= itemCount) {
      setAdded(false);
      setFeedback({ tone: 'error', message: `You already have the maximum available quantity (${itemCount}) in your cart.` });
      return;
    }

    setIsAdding(true);
    try {
      const cart = await addProductToCart(productId, user.userId);
      const updatedQuantity = cart.items.find((item) => item.productId === productId)?.quantity ?? cartQuantity + 1;
      setCartQuantity(updatedQuantity);
      setAdded(true);
      setFeedback({ tone: 'success', message: `Added to cart (${updatedQuantity} of ${itemCount} available).` });
      window.setTimeout(() => setAdded(false), 1400);
    } catch (error) {
      setAdded(false);
      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Could not add this product to your cart.' });
    } finally {
      setIsAdding(false);
    }
  };

  const soldOut = itemCount === 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <div className="relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-100">
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={cardName} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
          ) : (
            <div className="px-2 text-center text-xs text-gray-500"><div className="text-2xl" aria-hidden="true">🃏</div><span className="line-clamp-3">{cardName}</span></div>
          )}
          {source && (
            <span className={`absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${sourceStyle[source]}`}>
              {source === 'MARKETPLACE' ? 'Marketplace' : 'Official'}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-start">
          <p className="line-clamp-2 text-base font-semibold text-gray-900">{cardName}</p>
          <p className="mt-0.5 text-sm text-gray-500">{gameName}</p>
          {storeName && <p className="mt-0.5 truncate text-xs text-slate-400">{storeName}</p>}
          <p className={soldOut ? 'mt-1 text-sm text-red-600' : 'mt-1 text-sm text-gray-500'}>{soldOut ? 'Out of stock' : `${itemCount} items`}</p>
          <p className="mt-2 text-sm text-gray-500">Starting at <span className="block text-lg font-bold text-gray-900">{formatPrice(startingPrice)}</span></p>
        </div>
      </div>

      <button
        type="button"
        disabled={isAdding || soldOut}
        onClick={handleAddToCart}
        title={soldOut ? 'This product is out of stock' : 'Add to cart'}
        className="mt-5 w-full rounded-md bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added ? '✓ Added to Cart' : '🛒 Add to Cart'}
      </button>
      {feedback && (
        <p role={feedback.tone === 'error' ? 'alert' : 'status'} className={`mt-2 text-xs ${feedback.tone === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};

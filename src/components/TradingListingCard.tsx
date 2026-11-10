import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../api/cart';
import { formatPrice } from '../context/formatters';
import { useAuth } from '../context/AuthContext';

interface TradingListingCardProps {
  cardName: string;
  gameName: string;
  itemCount: number;
  startingPrice: number;
  imageUrl?: string | null;
  storeName?: string | null;
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
      window.dispatchEvent(new CustomEvent('cart-feedback', { detail: {
        tone: 'error', message: `You already have the maximum available quantity (${itemCount}) of ${cardName} in your cart.`,
      } }));
      return;
    }

    setIsAdding(true);
    try {
      const cart = await addProductToCart(productId, user.userId);
      const updatedQuantity = cart.items.find((item) => item.productId === productId)?.quantity ?? cartQuantity + 1;
      setCartQuantity(updatedQuantity);
      setAdded(true);
      setFeedback({ tone: 'success', message: `Added to cart (${updatedQuantity} of ${itemCount} available).` });
      window.dispatchEvent(new CustomEvent('cart-feedback', { detail: {
        tone: 'success', message: `${cardName} was added to your cart (${updatedQuantity} of ${itemCount} available).`,
      } }));
      window.setTimeout(() => setAdded(false), 1400);
    } catch (error) {
      setAdded(false);
      setFeedback({ tone: 'error', message: error instanceof Error ? error.message : 'Could not add this product to your cart.' });
      window.dispatchEvent(new CustomEvent('cart-feedback', { detail: {
        tone: 'error', message: error instanceof Error ? error.message : 'Could not add this product to your cart.',
      } }));
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenDetails = () => {
    if (productId) navigate(`/product/${productId}`);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (productId && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleOpenDetails();
    }
  };

  const soldOut = itemCount === 0;
  const isOfficial = source === 'OFFICIAL';
  const theme = isOfficial
    ? { border: 'border-blue-200 hover:border-blue-400 focus:ring-blue-500', image: 'from-blue-100 via-sky-50 to-indigo-50', accent: 'text-blue-600', action: 'bg-blue-50 text-blue-600 hover:bg-blue-600' }
    : { border: 'border-orange-200 hover:border-orange-400 focus:ring-orange-500', image: 'from-orange-100 via-amber-50 to-orange-50', accent: 'text-orange-600', action: 'bg-orange-50 text-orange-600 hover:bg-orange-500' };

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition ${theme.border} ${productId ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2' : ''}`}
      onClick={handleOpenDetails}
      onKeyDown={handleCardKeyDown}
      role={productId ? 'button' : undefined}
      tabIndex={productId ? 0 : undefined}
      aria-label={productId ? `View details for ${cardName}` : undefined}
    >
      <div className={`relative flex h-52 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${theme.image}`}>
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={cardName} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" onError={() => setImageFailed(true)} />
          ) : (
            <div className="px-2 text-center text-xs text-gray-500"><div className="text-2xl" aria-hidden="true">🃏</div><span className="line-clamp-3">{cardName}</span></div>
          )}
          {source && (
            <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${sourceStyle[source]}`}>
              {source === 'MARKETPLACE' ? 'Marketplace' : 'Official'}
            </span>
          )}
      </div>
      <div className="flex flex-grow flex-col p-4">
        {storeName && <p className={`text-xs font-semibold ${theme.accent}`}>{storeName}</p>}
        <p className="mt-1 line-clamp-2 font-bold text-slate-900">{cardName}</p>
        <p className="mt-1 text-xs text-slate-500">{gameName} · {itemCount} item{itemCount === 1 ? '' : 's'}</p>
        <div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-500">Starting at</p><p className={`font-extrabold ${theme.accent}`}>{formatPrice(startingPrice)}</p></div><span className={soldOut ? 'text-xs text-red-600' : 'text-xs text-emerald-600'}>{soldOut ? 'Out of stock' : 'Available'}</span></div>
      </div>

      <button
        type="button"
        disabled={isAdding || soldOut}
        onClick={(event) => {
          event.stopPropagation();
          void handleAddToCart();
        }}
        title={soldOut ? 'This product is out of stock' : 'Add to cart'}
        className={`mx-4 mb-4 rounded-md py-2.5 text-sm font-semibold transition-all duration-150 hover:text-white hover:shadow-md hover:scale-[1.02] active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${theme.action}`}
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

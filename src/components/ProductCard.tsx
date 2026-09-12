import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../api/cart';
import { formatPrice } from '../context/formatters';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  title: string;
  price: number;
  game?: string;
  imageUrl?: string;
  type?: string;
  source?: 'OFFICIAL' | 'MARKETPLACE';
  storeName?: string;
  stock?: number;
  productId?: number;
}

const sourceStyle = {
  OFFICIAL: 'bg-blue-600 text-white',
  MARKETPLACE: 'bg-orange-500 text-white',
};

export const ProductCard = ({
  title,
  price,
  game,
  imageUrl,
  type,
  source,
  storeName,
  stock,
  productId,
}: ProductCardProps) => {
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
    if (typeof stock === 'number' && cartQuantity >= stock) {
      setAdded(false);
      setFeedback({
        tone: 'error',
        message: `You already have the maximum available quantity (${stock}) in your cart.`,
      });
      return;
    }

    setIsAdding(true);
    try {
      const cart = await addProductToCart(productId, user.userId);
      const updatedQuantity = cart.items.find((item) => item.productId === productId)?.quantity ?? cartQuantity + 1;
      setCartQuantity(updatedQuantity);
      setAdded(true);
      setFeedback({
        tone: 'success',
        message: typeof stock === 'number'
          ? `Added to cart (${updatedQuantity} of ${stock} available).`
          : 'Added to cart.',
      });
      window.setTimeout(() => setAdded(false), 1400);
    } catch (error) {
      setAdded(false);
      setFeedback({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Could not add this product to your cart.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const soldOut = stock === 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-lg border bg-white p-4 shadow-sm">
      <div className="relative mb-4 flex h-48 w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={title} className="max-h-full object-contain" onError={() => setImageFailed(true)} />
        ) : (
          <div className="px-4 text-center">
            <div className="text-3xl" aria-hidden="true">🃏</div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{type ?? 'TCG'}</p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-600">{game ?? 'Card Game'}</p>
          </div>
        )}
        {source && (
          <span className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-bold ${sourceStyle[source]}`}>
            {source === 'OFFICIAL' ? 'Official' : 'Marketplace'}
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col">
        <h4 className="line-clamp-2 text-base font-semibold text-gray-900">{title}</h4>
        <p className="mt-2 text-lg font-bold text-gray-900">{formatPrice(price)}</p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="min-w-0">
          <span className="block truncate text-sm text-gray-500">{game}</span>
          {storeName && <span className="block truncate text-xs text-slate-400">{storeName}</span>}
          {typeof stock === 'number' && (
            <span className={soldOut ? 'text-xs text-red-600' : 'text-xs text-emerald-600'}>
              {soldOut ? 'Out of stock' : `${stock} in stock`}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || soldOut}
          title={soldOut ? 'This product is out of stock' : 'Add to cart'}
          aria-label="Add to cart"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {added ? '✓' : '🛒'}
        </button>
      </div>
      {feedback && (
        <p role={feedback.tone === 'error' ? 'alert' : 'status'} className={`mt-3 text-xs ${feedback.tone === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
          {feedback.message}
        </p>
      )}
    </div>
  );
};

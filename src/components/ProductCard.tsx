import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToCart } from '../api/cart';
import { formatPrice } from '../context/formatters';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  title: string;
  price: number;
  game?: string;
  imageUrl?: string | null;
  type?: string;
  source?: 'OFFICIAL' | 'MARKETPLACE';
  storeName?: string | null;
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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setImageFailed(false);
    setCartQuantity(0);
  }, [imageUrl, productId]);

  const handleAddToCart = async () => {
    if (!productId) return;
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (typeof stock === 'number' && cartQuantity >= stock) {
      setAdded(false);
      window.dispatchEvent(new CustomEvent('cart-feedback', { detail: {
        tone: 'error', message: `You already have the maximum available quantity (${stock}) of ${title} in your cart.`,
      } }));
      return;
    }

    setIsAdding(true);
    try {
      const cart = await addProductToCart(productId, user.userId);
      const updatedQuantity = cart.items.find((item) => item.productId === productId)?.quantity ?? cartQuantity + 1;
      setCartQuantity(updatedQuantity);
      setAdded(true);
      window.dispatchEvent(new CustomEvent('cart-feedback', { detail: {
        tone: 'success', message: typeof stock === 'number'
          ? `${title} was added to your cart (${updatedQuantity} of ${stock} available).`
          : `${title} was added to your cart.`,
      } }));
      window.setTimeout(() => setAdded(false), 1400);
    } catch (error) {
      setAdded(false);
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

  const soldOut = stock === 0;
  const isMarketplace = source === 'MARKETPLACE';
  const theme = isMarketplace
    ? { border: 'border-orange-200 hover:border-orange-400 focus:ring-orange-500', image: 'from-orange-100 via-amber-50 to-orange-50', price: 'text-orange-700', action: 'bg-orange-50 text-orange-600 hover:bg-orange-500' }
    : { border: 'border-blue-200 hover:border-blue-400 focus:ring-blue-500', image: 'from-blue-100 via-sky-50 to-indigo-50', price: 'text-blue-700', action: 'bg-blue-50 text-blue-600 hover:bg-blue-600' };

  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition duration-200 ${theme.border} ${productId ? 'cursor-pointer hover:-translate-y-0.5 hover:scale-[1.015] hover:shadow-md focus:outline-none focus:ring-2' : ''}`}
      onClick={handleOpenDetails}
      onKeyDown={handleCardKeyDown}
      role={productId ? 'button' : undefined}
      tabIndex={productId ? 0 : undefined}
      aria-label={productId ? `View details for ${title}` : undefined}
    >
      <div className={`relative flex h-52 w-full items-center justify-center overflow-hidden bg-gradient-to-br ${theme.image}`}>
        {imageUrl && !imageFailed ? (
          <img src={imageUrl} alt={title} className="h-full w-full object-contain" onError={() => setImageFailed(true)} />
        ) : (
          <div className="px-4 text-center">
            <div className="text-3xl" aria-hidden="true">🃏</div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{type ?? 'TCG'}</p>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-600">{game ?? 'Card Game'}</p>
          </div>
        )}
        {source && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${sourceStyle[source]}`}>
            {source === 'OFFICIAL' ? 'Official' : 'Marketplace'}
          </span>
        )}
      </div>

      <div className="flex flex-grow flex-col p-4">
        {storeName && <p className={`text-xs font-semibold ${isMarketplace ? 'text-orange-600' : 'text-blue-600'}`}>{storeName}</p>}
        <h4 className="mt-1 line-clamp-2 font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-xs text-slate-500">{game}{type ? ` · ${type}` : ''}</p>
        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-xs text-slate-500">Price</p><p className={`font-extrabold ${theme.price}`}>{formatPrice(price)}</p></div>
          {typeof stock === 'number' && <span className={soldOut ? 'text-xs text-red-600' : 'text-xs text-emerald-600'}>{soldOut ? 'Out of stock' : `${stock} in stock`}</span>}
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-slate-100 px-4 py-3">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void handleAddToCart();
          }}
          disabled={isAdding || soldOut}
          title={soldOut ? 'This product is out of stock' : 'Add to cart'}
          aria-label="Add to cart"
          className={`flex h-9 w-9 items-center justify-center rounded-md border border-transparent transition-all duration-150 hover:text-white hover:scale-110 hover:shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${theme.action}`}
        >
          {added ? '✓' : '🛒'}
        </button>
      </div>
    </div>
  );
};

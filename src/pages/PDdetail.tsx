import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingCart,
} from 'lucide-react';
import { addProductToCart } from '../api/cart';
import { loadProduct, loadProductOffers } from '../api/catalog';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../context/formatters';
import type { CatalogProduct } from '../types/catalog';
import { encodeStoreId } from '../utils/storeSecurity';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [offers, setOffers] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const productId = Number(id);
    if (!Number.isInteger(productId) || productId <= 0) {
      setError('Invalid product id.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setProduct(null);
    setOffers([]);
    setFeedback(null);
    setQuantity(1);
    setImageFailed(false);

    loadProduct(productId)
      .then((loadedProduct) => {
        if (!cancelled) setProduct(loadedProduct);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Could not load this product.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    loadProductOffers(productId)
      .then((loadedOffers) => {
        if (!cancelled) setOffers(loadedOffers);
      })
      .catch(() => {
        if (!cancelled) setOffers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const isSoldOut = !product || product.stock <= 0;

  const detailRows = product ? [
    ['Card Game', product.game],
    ['Product Type', product.type],
    ...(product.sku ? [['SKU', product.sku]] : []),
    ...(product.productSet ? [['Set', product.productSet]] : []),
    ...(product.language ? [['Language', product.language]] : []),
    ['Available Stock', String(Math.max(product.stock, 0))],
    ['Store / Seller', product.store?.name || (product.source === 'OFFICIAL' ? 'Optracard Official Store' : 'Marketplace')],
  ] : [];

  const handleAddToCart = async () => {
    if (!product || isSoldOut) return;
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsAdding(true);
    setFeedback(null);
    try {
      for (let index = 0; index < quantity; index += 1) {
        await addProductToCart(product.id, user.userId);
      }
      setFeedback({
        tone: 'success',
        message: `Added ${quantity} item${quantity > 1 ? 's' : ''} to cart.`,
      });
    } catch (requestError: unknown) {
      setFeedback({
        tone: 'error',
        message: requestError instanceof Error ? requestError.message : 'Could not add this product to your cart.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 text-slate-600" role="status">
          <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
          Loading product details...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Unable to load product</h1>
        <p className="mt-2 text-slate-600">{error ?? 'Product not found.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </main>
    );
  }

  const sellerLabel = product.source === 'OFFICIAL'
    ? 'Sell By: Optracard Official Store'
    : `Sold by: ${product.store.name}`;
  const hasMultipleOffers = offers.length > 1;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-xl font-bold text-slate-900 transition-colors hover:text-blue-600 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5 stroke-[3]" />
          Back
        </button>

        <div className="grid gap-10 lg:grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <div className="flex justify-center lg:justify-start">
            <div className="flex aspect-[3/4] w-full max-w-[480px] items-center justify-center overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
              {product.imageUrl && !imageFailed ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="px-8 text-center text-slate-500">
                  <div className="text-6xl" aria-hidden="true">🃏</div>
                  <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em]">{product.type || 'TCG'}</p>
                  <p className="mt-2 text-sm">{product.game}</p>
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-emerald-700">{product.game}</span>
              <span className="rounded bg-slate-200 px-2.5 py-1 text-slate-700">{product.type}</span>
              <span className={`rounded px-2.5 py-1 ${product.source === 'OFFICIAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {product.source === 'OFFICIAL' ? 'Official Store' : 'Marketplace'}
              </span>
              {product.sku && (
                <span className="rounded bg-slate-100 px-2.5 py-1 text-slate-500 font-mono text-[11px] normal-case">
                  SKU: {product.sku}
                </span>
              )}
              <span className="ml-auto text-slate-400">Product ID: {product.id}</span>
            </div>

            <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <h1 className="text-3xl font-bold leading-tight text-blue-600 sm:text-4xl">{product.name}</h1>
              {product.source === 'OFFICIAL' ? (
                <div className="flex w-full max-w-[360px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm xl:shrink-0">
                  <span className="min-w-0 flex-1 truncate">{sellerLabel}</span>
                  <CheckCircle2 className="ml-2 h-4 w-4 shrink-0 fill-blue-600 text-white" aria-label="Verified official store" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => product.store.id && navigate(`/seller-profile/${encodeStoreId(product.store.id)}`)}
                  className="flex w-full max-w-[360px] items-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-600 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 xl:shrink-0"
                  aria-label={`View ${product.store.name} seller profile`}
                >
                  <span className="min-w-0 flex-1 truncate">{sellerLabel}</span>
                  <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-blue-500" aria-hidden="true" />
                </button>
              )}
            </div>

            <section className="mt-7 rounded-xl border border-slate-300 bg-white p-6 shadow-sm" aria-label="Purchase information">
              <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Price</p>
                  <p className="mt-1 text-4xl font-bold text-blue-600">{formatPrice(product.price)}</p>
                </div>
                <div className="text-right">
                  <p className={isSoldOut ? 'font-bold text-red-600' : 'font-bold text-emerald-600'}>
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />
                    {isSoldOut ? 'Out of Stock' : 'In Stock'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isSoldOut ? 'No items available' : `Only ${product.stock} item${product.stock === 1 ? '' : 's'} left`}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row">
                <div className="flex h-12 items-center justify-between rounded-lg border border-slate-300 sm:w-36">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    onKeyDown={handleQuantityKeyDown}
                    disabled={isSoldOut || quantity <= 1}
                    aria-label="Decrease quantity"
                    className="px-4 text-slate-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                    onKeyDown={handleQuantityKeyDown}
                    disabled={isSoldOut || quantity >= product.stock}
                    aria-label="Increase quantity"
                    className="px-4 text-slate-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={isAdding || isSoldOut}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 cursor-pointer"
                >
                  {isAdding ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ShoppingCart className="h-5 w-5" />}
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
              {feedback && (
                <p role={feedback.tone === 'error' ? 'alert' : 'status'} className={`mt-4 text-sm ${feedback.tone === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
                  {feedback.message}
                </p>
              )}
            </section>

            {hasMultipleOffers && (
              <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">Also sold by other shops</h2>
                    <p className="mt-1 text-sm text-slate-600">Compare price and available stock before choosing an offer.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {offers.map((offer) => {
                    const selected = offer.id === product.id;
                    const isOfficial = offer.source === 'OFFICIAL';
                    return (
                      <div key={offer.id} className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${selected ? 'border-blue-300 bg-white' : 'border-slate-200 bg-white/80'}`}>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-slate-900">{offer.store.name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${isOfficial ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {isOfficial ? 'Official Store' : 'Marketplace'}
                            </span>
                            {selected && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Selected</span>}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{Math.max(offer.stock, 0)} item{offer.stock === 1 ? '' : 's'} available</p>
                        </div>
                        <div className="flex items-center gap-4 sm:justify-end">
                          <span className="text-xl font-bold text-blue-600">{formatPrice(offer.price)}</span>
                          <button
                            type="button"
                            disabled={selected}
                            onClick={() => navigate(`/product/${offer.id}`, { replace: true })}
                            className="rounded-lg border border-blue-600 px-3 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-600 hover:text-white disabled:cursor-default disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500"
                          >
                            {selected ? 'Current offer' : 'Choose this shop'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold">Card Details</h2>
              <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">
                <dl>
                  {detailRows.map(([label, value], index) => (
                    <div key={label} className={`flex items-center justify-between gap-6 px-5 py-3.5 ${index < detailRows.length - 1 ? 'border-b border-slate-200' : ''}`}>
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="text-right font-bold text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section className="mt-8 pb-8">
              <h2 className="mb-4 text-xl font-bold">Description</h2>
              <div className="whitespace-pre-line text-base leading-7 text-slate-600">
                {product.description?.trim() || 'No description available for this product.'}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, LoaderCircle, MapPin, Package, Store, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadMarketplaceStore } from '../api/catalog';
import { loadMyStore } from '../api/seller';
import { useAuth } from '../context/AuthContext';
import { decodeStoreId, encodeStoreId } from '../utils/storeSecurity';
import { ProductCard } from '../components/ProductCard';
import type { MarketplaceStoreProfile } from '../types/catalog';
import defaultAvatar from '../assets/Generic avatar.png';

type SortId = 'newest' | 'price-low' | 'price-high';

export interface SellerProfileProps {
  isOwnerOnly?: boolean;
}

export const SellerProfile = ({ isOwnerOnly = false }: SellerProfileProps) => {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();
  const { user } = useAuth();

  const [store, setStore] = useState<MarketplaceStoreProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTraversalBlocked, setIsTraversalBlocked] = useState(false);
  const [isOwnStore, setIsOwnStore] = useState(false);
  const [sortBy, setSortBy] = useState<SortId>('newest');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setIsTraversalBlocked(false);

    const resolveAndLoadStore = async () => {
      try {
        // Case 1: Route to seller's own store (/seller-profile/my or /seller-profile with isOwnerOnly)
        if (isOwnerOnly || !sellerId || sellerId === 'my') {
          setIsOwnStore(true);
          const myStore = await loadMyStore();
          if (cancelled) return;
          if (!myStore || !myStore.storeId) {
            throw new Error('Your seller store profile could not be found.');
          }
          const profile = await loadMarketplaceStore(myStore.storeId);
          if (cancelled) return;
          setStore(profile);
          setIsLoading(false);
          return;
        }

        // Case 2: Specific sellerId or token provided
        const targetId = decodeStoreId(sellerId);
        if (!targetId) {
          if (cancelled) return;
          setError('Invalid or expired store address. The requested storefront cannot be verified.');
          setIsLoading(false);
          return;
        }

        // Traversal Prevention: If a logged-in SELLER attempts to traverse to another store ID
        if (user?.role === 'SELLER') {
          try {
            const myStore = await loadMyStore();
            if (cancelled) return;
            if (myStore && myStore.storeId === targetId) {
              // Redirect to safe route without numeric ID
              navigate('/seller-profile/my', { replace: true });
              return;
            } else {
              setIsTraversalBlocked(true);
              setError('Access Restricted: URL traversal detected. Seller accounts are restricted from accessing other merchant profiles.');
              setIsLoading(false);
              return;
            }
          } catch (verifyError) {
            console.error('Failed to verify store ownership:', verifyError);
          }
        }

        // Case 3: Public marketplace view (buyer or guest)
        // If raw sequential integer ID was provided in URL, normalize to obfuscated token
        if (!sellerId.startsWith('sp_')) {
          navigate(`/seller-profile/${encodeStoreId(targetId)}`, { replace: true });
          return;
        }

        setIsOwnStore(false);
        const profile = await loadMarketplaceStore(targetId);
        if (cancelled) return;
        setStore(profile);
        setIsLoading(false);
      } catch (requestError: unknown) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : 'Could not load this seller profile.');
          setIsLoading(false);
        }
      }
    };

    resolveAndLoadStore();

    return () => {
      cancelled = true;
    };
  }, [sellerId, isOwnerOnly, user?.role, navigate]);

  const products = useMemo(() => {
    if (!store) return [];
    return [...store.products].sort((first, second) => {
      if (sortBy === 'price-low') return first.price - second.price;
      if (sortBy === 'price-high') return second.price - first.price;
      return second.id - first.id;
    });
  }, [sortBy, store]);

  if (isLoading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 text-slate-600">
          <LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />
          Loading seller profile...
        </div>
      </main>
    );
  }

  if (isTraversalBlocked) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600 ring-8 ring-red-50">
          <ShieldAlert className="h-12 w-12" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Security Restriction: Access Blocked</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          URL traversal detected. You are logged in with a merchant seller account and are restricted from directly traversing other merchant profiles via URL parameters.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/seller-profile/my')}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white shadow-sm hover:bg-blue-700 cursor-pointer"
          >
            Go to My Storefront
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer"
          >
            Seller Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <h1 className="mt-4 text-xl font-bold text-slate-900">Seller profile unavailable</h1>
        <p className="mt-2 text-slate-600">{error ?? 'Seller not found.'}</p>
        <button
          type="button"
          onClick={() => (isOwnStore ? navigate('/dashboard') : navigate(-1))}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          {isOwnStore ? 'Back to Dashboard' : 'Back'}
        </button>
      </main>
    );
  }

  const imageUrl = store.profileImage || defaultAvatar;
  const location = store.location?.trim() || 'Thailand';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => (isOwnStore ? navigate('/dashboard') : navigate(-1))}
          className="mb-7 inline-flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-blue-600 cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          {isOwnStore ? 'Back to Dashboard' : 'Back'}
        </button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <img
                src={imageUrl}
                alt={`${store.name} profile`}
                className="h-20 w-20 shrink-0 rounded-full bg-slate-100 object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                    Marketplace seller
                  </span>
                  {isOwnStore && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Your Storefront
                    </span>
                  )}
                </div>
                <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">
                  {store.description?.trim() || 'This seller has not added a shop description yet.'}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  {location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
              <Store className="h-5 w-5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Live listings</p>
                <p className="text-2xl font-bold">{store.products.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Package className="h-5 w-5 text-blue-600" />
                All products from {store.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose any listing to view full details or add it to your cart.
              </p>
            </div>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortId)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500">
              This seller does not have a live listing yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  title={product.name}
                  price={product.price}
                  game={product.game}
                  imageUrl={product.imageUrl}
                  type={product.type}
                  source={product.source}
                  storeName={product.store.name}
                  stock={product.stock}
                  productId={product.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default SellerProfile;

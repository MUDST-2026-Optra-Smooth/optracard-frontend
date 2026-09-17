import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, LoaderCircle, MapPin, Package, Store } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadMarketplaceStore } from '../api/catalog';
import { ProductCard } from '../components/ProductCard';
import type { MarketplaceStoreProfile } from '../types/catalog';
import defaultAvatar from '../assets/Generic avatar.png';

type SortId = 'newest' | 'price-low' | 'price-high';

export const SellerProfile = () => {
  const navigate = useNavigate();
  const { sellerId } = useParams<{ sellerId: string }>();
  const [store, setStore] = useState<MarketplaceStoreProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortId>('newest');

  useEffect(() => {
    const storeId = Number(sellerId);
    if (!Number.isInteger(storeId) || storeId <= 0) {
      setError('Invalid seller profile.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setStore(null);
    loadMarketplaceStore(storeId)
      .then((profile) => {
        if (!cancelled) setStore(profile);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not load this seller profile.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const products = useMemo(() => {
    if (!store) return [];
    return [...store.products].sort((first, second) => {
      if (sortBy === 'price-low') return first.price - second.price;
      if (sortBy === 'price-high') return second.price - first.price;
      return second.id - first.id;
    });
  }, [sortBy, store]);

  if (isLoading) {
    return <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4"><div className="flex items-center gap-3 text-slate-600"><LoaderCircle className="h-6 w-6 animate-spin text-blue-600" />Loading seller profile...</div></main>;
  }

  if (error || !store) {
    return <main className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center"><AlertCircle className="h-10 w-10 text-red-500" /><h1 className="mt-4 text-xl font-bold text-slate-900">Seller profile unavailable</h1><p className="mt-2 text-slate-600">{error ?? 'Seller not found.'}</p><button type="button" onClick={() => navigate(-1)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"><ArrowLeft className="h-4 w-4" />Back</button></main>;
  }

  const imageUrl = store.profileImage || defaultAvatar;
  const location = store.location?.trim() || 'Thailand';

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-7 inline-flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-blue-600"><ArrowLeft className="h-5 w-5" />Back</button>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-4">
              <img src={imageUrl} alt={`${store.name} profile`} className="h-20 w-20 shrink-0 rounded-full bg-slate-100 object-cover ring-1 ring-slate-200" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{store.name}</h1>
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">Marketplace seller</span>
                </div>
                <p className="mt-2 max-w-2xl whitespace-pre-line text-sm leading-6 text-slate-600">{store.description?.trim() || 'This seller has not added a shop description yet.'}</p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="h-4 w-4 text-blue-600" />{location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-blue-700">
              <Store className="h-5 w-5" />
              <div><p className="text-xs font-semibold uppercase tracking-wide">Live listings</p><p className="text-2xl font-bold">{store.products.length}</p></div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="flex items-center gap-2 text-xl font-bold"><Package className="h-5 w-5 text-blue-600" />All products from {store.name}</h2><p className="mt-1 text-sm text-slate-500">Choose any listing to view full details or add it to your cart.</p></div>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortId)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/20"><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select>
          </div>
          {products.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-500">This seller does not have a live listing yet.</div> : <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} title={product.name} price={product.price} game={product.game} imageUrl={product.imageUrl} type={product.type} source={product.source} storeName={product.store.name} stock={product.stock} productId={product.id} />)}</div>}
        </section>
      </div>
    </main>
  );
};

export default SellerProfile;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { CatalogFilterDrawer } from '../components/CatalogFilterDrawer';
import { loadCatalogPage } from '../api/catalog';
import type { CatalogProduct, CatalogQuery } from '../types/catalog';

export function ViewAllCatalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const query = Object.fromEntries(searchParams.entries()) as CatalogQuery;
        const [official, marketplace] = await Promise.all([
          loadCatalogPage({ ...query, source: 'OFFICIAL', page: '0', pageSize: '100' }),
          loadCatalogPage({ ...query, source: 'MARKETPLACE', page: '0', pageSize: '100' }),
        ]);
        if (isCurrent) {
          // Keep the two public sources separate while fetching so Official always appears first.
          setProducts([...official.items, ...marketplace.items]);
          setError(null);
        }
      } catch {
        if (isCurrent) setError('We could not load the catalog right now. Please try again shortly.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };
    void loadProducts();
    return () => { isCurrent = false; };
  }, [searchParams.toString()]);

  const applyFilters = (params: URLSearchParams) => {
    params.delete('pending');
    const source = params.get('source');
    const target = source === 'OFFICIAL' ? '/ViewAllOOS' : source === 'MARKETPLACE' ? '/ViewAllTrading' : '/ViewAll';
    if (target === '/ViewAll') params.delete('source');
    navigate(`${target}?${params.toString()}`);
    setShowFilters(false);
  };

  const officialProducts = useMemo(() => products.filter((product) => product.source === 'OFFICIAL'), [products]);
  const marketplaceProducts = useMemo(() => products.filter((product) => product.source === 'MARKETPLACE'), [products]);

  return (
    <section className="min-h-full bg-[#f8f9fb] font-sans text-[#20242b]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <button type="button" onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-black">← Back</button>
        <div className="border-b border-[#e6e8ec] pb-6">
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-medium text-[#9198a3]"><Link className="hover:text-[#2f65ff]" to="/">Home</Link><span>/</span><span className="text-[#59616d]">All Products</span></nav>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f65ff]">Complete catalog</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">All Products</h1>
          <p className="mt-2 text-sm text-[#777f8b]">Official products first, followed by approved marketplace listings.</p>
        </div>

        <div className="flex items-center justify-between py-6">
          <button type="button" onClick={() => setShowFilters(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#44516a] bg-white px-4 py-2.5 text-sm font-semibold text-[#263b61] shadow-sm hover:border-blue-500"><span>☰</span> Filters</button>
          <p className="text-xs font-medium text-[#9198a3]">Showing {products.length} products</p>
        </div>

        <CatalogFilterDrawer open={showFilters} initialParams={searchParams} onClose={() => setShowFilters(false)} onApply={applyFilters} />
        {isLoading && <p className="py-16 text-center text-base text-slate-500">Loading catalog...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {officialProducts.map((product) => <ProductCard key={`official-${product.id}`} productId={product.id} title={product.name} price={product.price} game={product.game} imageUrl={product.imageUrl ?? undefined} type={product.type} source={product.source} storeName={product.store.name} stock={product.stock} />)}
            {marketplaceProducts.map((product) => <TradingListingCard key={`marketplace-${product.id}`} productId={product.id} cardName={product.name} gameName={product.game} itemCount={product.stock} startingPrice={product.price} imageUrl={product.imageUrl ?? undefined} storeName={product.store.name} source="MARKETPLACE" />)}
          </div>
        )}
        {!isLoading && !error && products.length === 0 && <p className="py-16 text-center text-base text-slate-500">No products found.</p>}
      </div>
    </section>
  );
}

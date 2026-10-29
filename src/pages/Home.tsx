import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { loadCatalogFilterOptions, loadCatalogPage } from '../api/catalog';
import type { CatalogProduct, CatalogSource, CatalogQuery } from '../types/catalog';

const PRODUCT_TYPES = ['Single', 'Booster', 'Booster Box', 'Accessories'];
const normalizeFilterValue = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

const sourceContent: Record<CatalogSource, { title: string; eyebrow: string; viewAll: string }> = {
  MARKETPLACE: {
    title: 'Marketplace & Trading',
    eyebrow: 'Independent seller listings',
    viewAll: '/ViewAllTrading',
  },
  OFFICIAL: {
    title: 'Optracard Official Store',
    eyebrow: 'Sold and fulfilled by Optracard',
    viewAll: '/ViewAllOOS',
  },
};

export const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appliedParams, setAppliedParams] = useState(() => new URLSearchParams(searchParams));
  useEffect(() => {
    if (!searchParams.has('pending')) setAppliedParams(new URLSearchParams(searchParams));
  }, [searchParams.toString()]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadCatalog = async () => {
      try {
        const active = searchParams.has('pending') ? appliedParams : searchParams;
        const query = Object.fromEntries(active.entries()) as CatalogQuery;
        // Home renders two independent sections. Fetch each public source separately so
        // pagination of one source cannot hide the other source from the first page.
        const data = query.source
          ? (await loadCatalogPage(query)).items
          : (await Promise.all([
            loadCatalogPage({ ...query, source: 'OFFICIAL', page: '0', pageSize: '24' }),
            loadCatalogPage({ ...query, source: 'MARKETPLACE', page: '0', pageSize: '24' }),
          ])).flatMap((result) => result.items);
        if (isCurrent) {
          setProducts(data);
          setError(null);
        }
      } catch {
        if (isCurrent) setError('We could not load the catalog right now. Please try again shortly.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadCatalog();
    return () => { isCurrent = false; };
  }, [searchParams.toString(), appliedParams.toString()]);

  const filteredProducts = useMemo(() => {
    const active = searchParams.has('pending') ? appliedParams : searchParams;
    const q = normalizeFilterValue(active.get('q'));
    const type = normalizeFilterValue(active.get('type')); const game = normalizeFilterValue(active.get('game'));
    const language = normalizeFilterValue(active.get('language')); const source = normalizeFilterValue(active.get('source')); const storeId = active.get('storeId');
    const min = Number(active.get('minPrice')); const max = Number(active.get('maxPrice'));
    return products.filter((product) => (!q || [product.name, product.game, product.type, product.description, product.store.name].some(v => normalizeFilterValue(v).includes(q)))
      && (!type || normalizeFilterValue(product.type) === type) && (!game || normalizeFilterValue(product.game) === game) && (!language || normalizeFilterValue(product.language) === language)
      && (!source || normalizeFilterValue(product.source) === source) && (!storeId || String(product.store.id) === storeId)
      && (!active.get('minPrice') || product.price >= min) && (!active.get('maxPrice') || product.price <= max));
  }, [products, searchParams.toString(), appliedParams.toString()]);

  const productsBySourceAndType = useMemo(() => {
    return (source: CatalogSource, type: string) =>
      filteredProducts.filter((product) => product.source === source && normalizeFilterValue(product.type) === normalizeFilterValue(type)).slice(0, 4);
  }, [filteredProducts]);

  const renderOfficialProductSection = (type: string) => {
    const source: CatalogSource = 'OFFICIAL';
    const catalogProducts = productsBySourceAndType(source, type);
    const destination = `/ViewAllOOS?type=${encodeURIComponent(type)}`;

    return (
      <div key={`${source}-${type}`} className="mb-10 text-left">
        <div className="flex justify-between items-center gap-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900">{type}</h3>
          <Link
            to={destination}
            className="shrink-0 bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalogProducts.map((product) => (
            <ProductCard
              key={product.id}
              productId={product.id}
              title={product.name}
              price={product.price}
              game={product.game}
              imageUrl={product.imageUrl ?? undefined}
              type={product.type}
              source={product.source}
              storeName={product.store.name}
              stock={product.stock}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderMarketplaceSection = () => {
    const marketplaceProducts = filteredProducts.filter((product) => product.source === 'MARKETPLACE').slice(0, 9);

    return (
      <section key="MARKETPLACE" className="mb-16">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{sourceContent.MARKETPLACE.eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black text-slate-900">{sourceContent.MARKETPLACE.title}</h2>
          </div>
          <Link
            to={sourceContent.MARKETPLACE.viewAll}
            className="shrink-0 rounded-md bg-[#1e5bff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketplaceProducts.map((product) => (
            <TradingListingCard
              key={product.id}
              productId={product.id}
              cardName={product.name}
              gameName={product.game}
              itemCount={product.stock}
              startingPrice={product.price}
              imageUrl={product.imageUrl ?? undefined}
              storeName={product.store.name}
              source="MARKETPLACE"
            />
          ))}
        </div>
      </section>
    );
  };

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams); if (value) next.set(key, value); else next.delete(key); setSearchParams(next);
  };
  const filteredCount = products.filter((product) => {
    const source = searchParams.get('source'); const type = searchParams.get('type'); const game = searchParams.get('game'); const language = searchParams.get('language');
    return (!source || product.source === source) && (!type || product.type === type) && (!game || product.game === game) && (!language || product.language === language);
  }).length;

  return (
    <div className="bg-slate-50">
      <section className="w-full bg-gradient-to-r from-[#082666] via-[#1649bb] to-[#2f65ff] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">Optracard marketplace</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Discover cards, sealed products and TCG essentials.</h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100">Shop Optracard Official Store or listings from approved community sellers.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {false && searchParams.get('advanced') === '1' && (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3"><span>⌕</span><input value={searchParams.get('q') ?? ''} onChange={e => updateFilter('q', e.target.value)} placeholder="Search Keywords" className="w-full bg-transparent outline-none" /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {([['type','All Types',Array.from(new Set(products.map(p => p.type)))],['game','All Games',Array.from(new Set(products.map(p => p.game)))],['language','All Languages',Array.from(new Set(products.map(p => p.language).filter(Boolean) as string[]))],['source','Store Source',['OFFICIAL','MARKETPLACE']],['storeId','Store',Array.from(new Map(products.filter(p => p.source === 'MARKETPLACE' && p.store.id).map(p => [String(p.store.id), p.store.name])).entries())]] as const).map(([key,label,values]) => <label key={key} className="text-xs font-semibold text-slate-500">{label}<select value={searchParams.get(key) ?? ''} onChange={e => updateFilter(key, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"><option value="">All</option>{values.map(v => Array.isArray(v) ? <option key={v[0]} value={v[0]}>{v[1]}</option> : <option key={v} value={v}>{v}</option>)}</select></label>)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3"><input type="number" min="0" placeholder="Min Price" value={searchParams.get('minPrice') ?? ''} onChange={e => updateFilter('minPrice', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2" /><input type="number" min="0" placeholder="Max Price" value={searchParams.get('maxPrice') ?? ''} onChange={e => updateFilter('maxPrice', e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2" /></div>
            <p className="mt-3 text-xs text-slate-500">{filteredCount} products match your filters</p>
          </div>
        )}
        {isLoading && <p className="py-16 text-center text-base text-slate-500">Loading catalog...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>}
        {!isLoading && !error && (
          <>
            <section key="OFFICIAL" className="mb-16">
              <div className="mb-8 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{sourceContent.OFFICIAL.eyebrow}</p>
                  <h2 className="mt-1 text-3xl font-black text-slate-900">{sourceContent.OFFICIAL.title}</h2>
                </div>
              </div>
              {PRODUCT_TYPES
                .filter((type) => productsBySourceAndType('OFFICIAL', type).length > 0)
                .map(renderOfficialProductSection)}
            </section>
            {renderMarketplaceSection()}
          </>
        )}
      </section>
    </div>
  );
};

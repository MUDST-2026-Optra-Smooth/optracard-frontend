import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { CatalogFilterDrawer } from '../components/CatalogFilterDrawer';
import { searchCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';

const sortOptions: DropdownOption[] = [
  { label: 'Most Relevant', value: 'relevance' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
];

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    const fetchResults = async () => {
      try {
        const data = await searchCatalog(query);
        if (isCurrent) {
          setProducts(data);
          setError(null);
        }
      } catch {
        if (isCurrent) setError('ไม่สามารถโหลดข้อมูลการค้นหาได้ในขณะนี้');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void fetchResults();
    return () => { isCurrent = false; };
  }, [query]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => matchesFilters(product, searchParams));

    if (selectedSort.value === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort.value === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (selectedSort.value === 'newest') {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, searchParams.toString(), selectedSort]);

  const marketplaceListings = useMemo(
    () => filteredProducts.filter((p) => p.source === 'MARKETPLACE'),
    [filteredProducts]
  );

  const officialProducts = useMemo(
    () => filteredProducts.filter((p) => p.source === 'OFFICIAL'),
    [filteredProducts]
  );

  const officialCategories = useMemo(() => {
    const types = Array.from(new Set(officialProducts.map((p) => p.type).filter(Boolean)));
    const preferredOrder = ['Single', 'Booster', 'Booster Box', 'Accessories'];
    return types.sort((a, b) => {
      const idxA = preferredOrder.indexOf(a);
      const idxB = preferredOrder.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [officialProducts]);

  const applyFilters = (params: URLSearchParams) => {
    params.delete('pending');
    if (query) params.set('q', query);
    else params.delete('q');
    navigate(`/search?${params.toString()}`);
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Search Result{query && ` : ${query}`}
        </h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-700 hover:text-black font-medium cursor-pointer">
          ← Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-10">
        <button type="button" onClick={() => setShowFilters(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#44516a] bg-white px-4 py-2.5 text-sm font-semibold text-[#263b61] shadow-sm hover:border-blue-500"><span>☰</span> Filters</button>
        <FilterDropdown label="Sort by :" options={sortOptions} selected={selectedSort} onSelect={setSelectedSort} align="right" />
      </div>

      <CatalogFilterDrawer open={showFilters} initialParams={searchParams} onClose={() => setShowFilters(false)} onApply={applyFilters} />

      {isLoading && <p className="text-center py-10">กำลังค้นหาสินค้า...</p>}
      {error && <p className="text-center text-red-600 py-10">{error}</p>}

      {!isLoading && !error && filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-10">ไม่พบสินค้าที่ตรงกับคำค้นหา "{query}"</p>
      )}

      {!isLoading && !error && filteredProducts.length > 0 && (
        <>
          {officialProducts.length > 0 && (
            <section className="mb-12">
              <div className="mb-8 border-b border-slate-200 pb-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Sold and fulfilled by Optracard</p>
                <h2 className="mt-1 text-3xl font-black text-slate-900">Optracard Official Store</h2>
              </div>
              
              {officialCategories.map((type) => {
                const items = officialProducts.filter((p) => p.type === type);
                if (items.length === 0) return null;

                return (
                  <div key={type} className="text-left mb-10">
                    <div className="flex justify-between items-center mb-4">
                      <Link
                        to={`/ViewAllOOS?type=${encodeURIComponent(type)}`}
                        className="group flex items-center gap-2 text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        <span>{type}</span>
                        <span className="text-sm text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                      <Link
                        to={`/ViewAllOOS?type=${encodeURIComponent(type)}`}
                        className="shrink-0 bg-[#1e5bff] text-white text-xs font-medium px-3.5 py-1.5 rounded-md hover:bg-blue-700 transition-all shadow-sm hover:shadow cursor-pointer"
                      >
                        View all {type} →
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {items.map((card) => (
                        <ProductCard
                          key={card.id}
                          productId={card.id}
                          title={card.name}
                          price={card.price}
                          game={card.game}
                          imageUrl={card.imageUrl ?? undefined}
                          type={card.type}
                          source={card.source}
                          storeName={card.store?.name}
                          stock={card.stock}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {marketplaceListings.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">Independent seller listings</p>
                  <Link
                    to="/ViewAllTrading"
                    className="mt-1 text-2xl font-black text-slate-900 hover:text-blue-600 transition-colors cursor-pointer block"
                  >
                    Marketplace & Trading
                  </Link>
                </div>
                <Link
                  to="/ViewAllTrading"
                  className="shrink-0 rounded-md bg-[#1e5bff] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow cursor-pointer"
                >
                  View all marketplace →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListings.map((listing) => (
                  <TradingListingCard
                    key={listing.id}
                    productId={listing.id}
                    cardName={listing.name}
                    gameName={listing.game}
                    itemCount={listing.stock}
                    startingPrice={listing.price}
                    imageUrl={listing.imageUrl ?? undefined}
                    storeName={listing.store?.name}
                    source="MARKETPLACE"
                  />
                ))}
              </div>
            </section>
          )}

        </>
      )}
    </div>
  );
};

function matchesFilters(product: CatalogProduct, params: URLSearchParams): boolean {
  const matches = (value: string | null, productValue: string | null | undefined) =>
    !value || productValue?.trim().toLowerCase() === value.trim().toLowerCase();
  const minPrice = parsePrice(params.get('minPrice'));
  const maxPrice = parsePrice(params.get('maxPrice'));

  return matches(params.get('type'), product.type)
    && matches(params.get('game'), product.game)
    && matches(params.get('language'), product.language)
    && matches(params.get('source'), product.source)
    && (!params.get('storeId') || String(product.store.id ?? '') === params.get('storeId'))
    && (minPrice === null || product.price >= minPrice)
    && (maxPrice === null || product.price <= maxPrice);
}

function parsePrice(value: string | null): number | null {
  if (value === null || value.trim() === '') return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
}

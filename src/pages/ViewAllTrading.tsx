import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TradingListingCard } from '../components/TradingListingCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { CatalogFilterDrawer } from '../components/CatalogFilterDrawer';
import { loadCatalogPage } from '../api/catalog';
import type { CatalogQuery } from '../types/catalog';
import type { CatalogProduct } from '../types/catalog';

const sortOptions: DropdownOption[] = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'In Stock First', value: 'stock' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'A-Z', value: 'a-z' },
  { label: 'Z-A', value: 'z-a' },
];

export function ViewAllTrading() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [appliedParams, setAppliedParams] = useState(() => new URLSearchParams(searchParams));
  useEffect(() => { if (!searchParams.has('pending')) setAppliedParams(new URLSearchParams(searchParams)); }, [searchParams.toString()]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DropdownOption>({ label: 'All types', value: 'All', shortLabel: 'All' });
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);
  const [showFilters, setShowFilters] = useState(false);

  const typeOptions = useMemo<DropdownOption[]>(() => {
    const types = Array.from(new Set(products.map((product) => product.type))).sort((a, b) => a.localeCompare(b));
    return [
      { label: 'All types', value: 'All', shortLabel: 'All' },
      ...types.map((type) => ({ label: type, value: type })),
    ];
  }, [products]);

  useEffect(() => {
    const activeParams = searchParams.has('pending') ? appliedParams : searchParams;
    const typeFromUrl = activeParams.get('type');
    if (typeFromUrl && typeOptions.some((option) => option.value === typeFromUrl)) {
      setSelectedType({ label: typeFromUrl, value: typeFromUrl });
    }
    if (!typeOptions.some((option) => option.value === selectedType.value)) {
      setSelectedType(typeOptions[0]);
    }
  }, [selectedType.value, typeOptions, searchParams.toString(), appliedParams.toString()]);

  useEffect(() => {
    let isCurrent = true;

    const loadMarketplace = async () => {
      try {
        const active = searchParams.has('pending') ? appliedParams : searchParams;
        const data = (await loadCatalogPage({ ...Object.fromEntries(active.entries()), source: 'MARKETPLACE' } as CatalogQuery)).items;
        if (isCurrent) {
          setProducts(data.filter((product) => product.source === 'MARKETPLACE'));
          setError(null);
        }
      } catch {
        if (isCurrent) setError('We could not load marketplace listings right now. Please try again shortly.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadMarketplace();
    return () => { isCurrent = false; };
  }, [searchParams.toString(), appliedParams.toString()]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleProducts = useMemo(() => {
    const activeParams = searchParams.has('pending') ? appliedParams : searchParams;
    const q = (activeParams.get('q') ?? '').trim().toLowerCase();
    const game = activeParams.get('game')?.toLowerCase(); const language = activeParams.get('language')?.toLowerCase();
    const min = Number(activeParams.get('minPrice')); const max = Number(activeParams.get('maxPrice'));
    const filtered = selectedType.value === 'All' 
      ? [...products] 
      : products.filter((product) => product.type === selectedType.value);
    const advanced = filtered.filter((product) => (!q || [product.name, product.game, product.type, product.description, product.store.name].some(value => value?.toLowerCase().includes(q)))
      && (!game || product.game.toLowerCase() === game) && (!language || product.language?.toLowerCase() === language)
      && (!activeParams.get('storeId') || String(product.store.id) === activeParams.get('storeId'))
      && (!activeParams.get('minPrice') || product.price >= min) && (!activeParams.get('maxPrice') || product.price <= max));

    if (selectedSort.value === 'stock') return advanced.sort((a, b) => b.stock - a.stock);
    if (selectedSort.value === 'price-low') return advanced.sort((a, b) => a.price - b.price);
    if (selectedSort.value === 'price-high') return advanced.sort((a, b) => b.price - a.price);
    if (selectedSort.value === 'a-z') return advanced.sort((a, b) => a.name.localeCompare(b.name));
    if (selectedSort.value === 'z-a') return advanced.sort((a, b) => b.name.localeCompare(a.name));
    return advanced;
  }, [products, selectedType.value, selectedSort.value, searchParams.toString(), appliedParams.toString()]);

  const applyFilters = (params: URLSearchParams) => {
    params.delete('pending');
    const target = params.get('source') === 'OFFICIAL' ? '/ViewAllOOS' : params.get('source') === 'MARKETPLACE' ? '/ViewAllTrading' : '/ViewAll';
    if (target === '/ViewAll') params.delete('source');
    else params.set('source', target === '/ViewAllOOS' ? 'OFFICIAL' : 'MARKETPLACE');
    setShowFilters(false);
    navigate(`${target}?${params.toString()}`);
  };

  return (
    <section className="min-h-full bg-[#f8f9fb] font-sans text-[#20242b]">
      <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <button
          className="mb-6 flex items-center gap-1 text-sm font-semibold text-gray-700 transition hover:text-black"
          onClick={() => navigate(-1)}
          type="button"
        >
          ← Back
        </button>

        <div className="border-b border-[#e6e8ec] pb-6">
          <div>
            <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-medium text-[#9198a3]">
              <Link className="transition hover:text-[#2f65ff]" to="/">Home</Link>
              <span>/</span>
              <span className="text-[#59616d]">Marketplace</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f65ff]">Shop everything</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">Marketplace &amp; Trading</h1>
            <p className="mt-2 text-sm text-[#777f8b]">Browse cards, sealed products and accessories for your next game.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <button type="button" onClick={() => setShowFilters(true)} className="inline-flex items-center gap-2 rounded-lg border border-[#44516a] bg-white px-4 py-2.5 text-sm font-semibold text-[#263b61] shadow-sm hover:border-blue-500"><span>☰</span> Filters</button>

          <div className="flex flex-col items-start gap-2 sm:items-end">
             <FilterDropdown
              label="Sort by:"
              options={sortOptions}
              selected={selectedSort}
              onSelect={setSelectedSort}
              align="right"
            />
            <p className="text-xs font-medium text-[#9198a3]">Showing {visibleProducts.length} products</p>
          </div>
        </div>

        <CatalogFilterDrawer open={showFilters} initialParams={searchParams} onClose={() => setShowFilters(false)} onApply={applyFilters} />

        {/* ปรับ Grid เป็น lg:grid-cols-3 และลบ xl:grid-cols-4 ออก เพื่อให้การ์ดแนวนอนไม่แคบเกินไป */}
        {isLoading && <p className="py-16 text-center text-base text-slate-500">Loading marketplace listings...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
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
            {visibleProducts.length === 0 && (
              <p className="col-span-full py-16 text-center text-slate-500">No marketplace listings match this filter.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

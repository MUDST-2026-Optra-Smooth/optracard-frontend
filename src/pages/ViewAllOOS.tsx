import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { loadCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';

const sortOptions: DropdownOption[] = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'In Stock First', value: 'stock' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'A-Z', value: 'a-z' },
  { label: 'Z-A', value: 'z-a' },
];

export function ViewAllOOS() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productType = searchParams.get('type') || 'Single';

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [selectedGame, setSelectedGame] = useState<DropdownOption>({ label: 'All games', value: 'All', shortLabel: 'All' });
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    setSelectedGame({ label: 'All games', value: 'All', shortLabel: 'All' });
  }, [productType]);

  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      try {
        const data = await loadCatalog();
        if (isCurrent) {
          setProducts(data);
          setError(null);
        }
      } catch {
        if (isCurrent) setError('We could not load the official catalog right now. Please try again shortly.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadProducts();
    return () => { isCurrent = false; };
  }, []);

  const typeProducts = useMemo(
    () => products.filter((product) => product.source === 'OFFICIAL' && product.type === productType),
    [products, productType],
  );

  const gameOptions = useMemo<DropdownOption[]>(() => {
    const games = Array.from(new Set(typeProducts.map((product) => product.game))).sort();
    return [
      { label: 'All games', value: 'All', shortLabel: 'All' },
      ...games.map((game) => ({ label: game, value: game })),
    ];
  }, [typeProducts]);

  const visibleProducts = useMemo(() => {
    const filtered = selectedGame.value === 'All' 
      ? [...typeProducts]
      : typeProducts.filter((product) => product.game === selectedGame.value);

    if (selectedSort.value === 'stock') return filtered.sort((a, b) => b.stock - a.stock);
    if (selectedSort.value === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (selectedSort.value === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (selectedSort.value === 'a-z') return filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (selectedSort.value === 'z-a') return filtered.sort((a, b) => b.name.localeCompare(a.name));
    return filtered;
  }, [selectedGame, selectedSort, typeProducts]);

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

        <div className="flex flex-col gap-5 border-b border-[#e6e8ec] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs font-medium text-[#9198a3]">
              <Link className="transition hover:text-[#2f65ff]" to="/">Home</Link>
              <span>/</span>
              <span className="text-[#59616d]">{productType}</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f65ff]">Card collection</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">{productType}</h1>
            <p className="mt-2 text-sm text-[#777f8b]">Find the perfect {productType.toLowerCase()} to complete your collection.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <FilterDropdown
            label="Game:"
            options={gameOptions}
            selected={selectedGame}
            onSelect={setSelectedGame}
          />

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

        {isLoading && <p className="py-16 text-center text-base text-slate-500">Loading official products...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {visibleProducts.map((product) => (
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
            {visibleProducts.length === 0 && (
              <p className="py-16 text-center text-base text-slate-500">No official products found for this category.</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

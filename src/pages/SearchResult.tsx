import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { searchCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';

const defaultGameOptions: DropdownOption[] = [
  { label: 'All Games', value: 'all', shortLabel: 'All' },
  { label: 'Pokemon', value: 'Pokemon' },
  { label: 'Battle of Talingchan', value: 'Battle of Talingchan' },
  { label: 'One Piece', value: 'One Piece' },
];

const sortOptions: DropdownOption[] = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
];

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [selectedGame, setSelectedGame] = useState<DropdownOption>(defaultGameOptions[0]);
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);
  
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

  const gameOptions = useMemo<DropdownOption[]>(() => {
    const games = Array.from(new Set(products.map((p) => p.game).filter(Boolean))).sort();
    if (games.length === 0) return defaultGameOptions;
    return [
      { label: 'All Games', value: 'all', shortLabel: 'All' },
      ...games.map((g) => ({ label: g, value: g })),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedGame.value !== 'all') {
      result = result.filter(
        (p) => p.game.toLowerCase() === selectedGame.value.toLowerCase() || p.game === selectedGame.label
      );
    }

    if (selectedSort.value === 'price_asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (selectedSort.value === 'price_desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (selectedSort.value === 'newest') {
      result = [...result].sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, selectedGame, selectedSort]);

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
        <FilterDropdown label="Game:" options={gameOptions} selected={selectedGame} onSelect={setSelectedGame} />
        <FilterDropdown label="Sort by :" options={sortOptions} selected={selectedSort} onSelect={setSelectedSort} align="right" />
      </div>

      {isLoading && <p className="text-center py-10">กำลังค้นหาสินค้า...</p>}
      {error && <p className="text-center text-red-600 py-10">{error}</p>}

      {!isLoading && !error && filteredProducts.length === 0 && (
        <p className="text-center text-gray-500 py-10">ไม่พบสินค้าที่ตรงกับคำค้นหา "{query}"</p>
      )}

      {!isLoading && !error && filteredProducts.length > 0 && (
        <>
          {marketplaceListings.length > 0 && (
            <section className="mb-12">
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">Independent seller listings</p>
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

          {officialProducts.length > 0 && (
            <section className="text-center">
              <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>
              
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
          <section className="text-center">
            <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>
            
            {singleCards.length > 0 && (
              <div className="text-left mb-10">
                <h3 className="text-xl font-bold mb-4">Single</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {singleCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} storeName={card.store.name} stock={card.stock} />)}
                </div>
              </div>
            )}

            {boosterCards.length > 0 && (
              <div className="text-left mb-10">
                <h3 className="text-xl font-bold mb-4">Booster</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {boosterCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} storeName={card.store.name} stock={card.stock} />)}
                </div>
              </div>
            )}

            {boosterBoxCards.length > 0 && (
              <div className="text-left">
                <h3 className="text-xl font-bold mb-4">Booster Box</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {boosterBoxCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} storeName={card.store.name} stock={card.stock} />)}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

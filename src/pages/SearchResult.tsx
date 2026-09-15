import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';
import { searchCatalog } from '../api/catalog';
import type { CatalogProduct } from '../types/catalog';

const gameOptions: DropdownOption[] = [
  { label: 'All Games', value: 'all', shortLabel: 'All' },
  { label: 'Pokémon', value: 'pokemon' },
  { label: 'Battle of Talingchan', value: 'talingchan' },
  { label: 'One Piece', value: 'onepiece' },
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

  const [selectedGame, setSelectedGame] = useState<DropdownOption>(gameOptions[0]);
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
      } catch (err) {
        if (isCurrent) setError('ไม่สามารถโหลดข้อมูลการค้นหาได้ในขณะนี้');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void fetchResults();
    return () => { isCurrent = false; };
  }, [query]);

  const marketplaceListings = products.filter(p => p.source === 'MARKETPLACE');
  const singleCards = products.filter(p => p.source === 'OFFICIAL' && p.type === 'Single');
  const boosterCards = products.filter(p => p.source === 'OFFICIAL' && p.type === 'Booster');
  const boosterBoxCards = products.filter(p => p.source === 'OFFICIAL' && p.type === 'Booster Box');

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Search Result{query && ` : ${query}`}
        </h1>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-700 hover:text-black font-medium">
          ← Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-10">
        <FilterDropdown label="Game:" options={gameOptions} selected={selectedGame} onSelect={setSelectedGame} />
        <FilterDropdown label="Sort by :" options={sortOptions} selected={selectedSort} onSelect={setSelectedSort} align="right" />
      </div>

      {isLoading && <p className="text-center py-10">กำลังค้นหาสินค้า...</p>}
      {error && <p className="text-center text-red-600 py-10">{error}</p>}

      {!isLoading && !error && products.length === 0 && (
        <p className="text-center text-gray-500 py-10">ไม่พบสินค้าที่ตรงกับคำค้นหา "{query}"</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <>
          {marketplaceListings.length > 0 && (
            <section className="mb-12">
              <div className="relative flex items-center justify-center mb-6">
                <h2 className="text-3xl font-bold text-blue-600">Marketplace & Trading</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {marketplaceListings.map(listing => (
                  <TradingListingCard 
                    key={listing.id}
                    productId={listing.id}
                    cardName={listing.name}
                    gameName={listing.game}
                    itemCount={listing.stock}
                    startingPrice={listing.price}
                    imageUrl={listing.imageUrl}
                    storeName={listing.store?.name}
                    source="MARKETPLACE"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="text-center">
            <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>
            
            {singleCards.length > 0 && (
              <div className="text-left mb-10">
                <h3 className="text-xl font-bold mb-4">Single</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {singleCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} />)}
                </div>
              </div>
            )}

            {boosterCards.length > 0 && (
              <div className="text-left mb-10">
                <h3 className="text-xl font-bold mb-4">Booster</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {boosterCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} />)}
                </div>
              </div>
            )}

            {boosterBoxCards.length > 0 && (
              <div className="text-left">
                <h3 className="text-xl font-bold mb-4">Booster Box</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {boosterBoxCards.map(card => <ProductCard key={card.id} productId={card.id} title={card.name} price={card.price} game={card.game} imageUrl={card.imageUrl} type={card.type} source={card.source} />)}
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';

// Placeholder data — swap for real API results once search backend exists
const marketplaceListings = [
  { cardName: 'พลทหารหิมะ', gameName: 'Battle of Talingchan', itemCount: 20, startingPrice: 298 },
  { cardName: 'พลทหารหิมะ', gameName: 'Battle of Talingchan', itemCount: 20, startingPrice: 298 },
  { cardName: 'พลทหารหิมะ', gameName: 'Battle of Talingchan', itemCount: 23, startingPrice: 298 },
];

const singleCards = [
  { title: 'Charizard ex (SVP) SIR', price: 250, game: 'Pokemon' },
  { title: 'Charizard & Reshiram GX (SM) SCR', price: 3900, game: 'Pokemon' },
];

const boosterCards = [
  { title: 'Pokemon MEGA "Dialga ex" JP 1 Pack', price: 250, game: 'Pokemon' },
  { title: 'MEGA "Miraidon ex" (JP) 1 Pack', price: 250, game: 'Pokemon' },
  { title: 'MEGA "Ninja Splinter" (JP) 1 Pack', price: 180, game: 'Pokemon' },
  { title: 'Mega "Symphonia" (JP) 1 Pack', price: 250, game: 'Pokemon' },
];

const boosterBoxCards = [
  { title: 'Pokemon [en/id] "Twilight Fortune ex" 1 Box', price: 17990, game: 'Pokemon' },
  { title: 'Pokemon [en] MEGA "Miraidon ex" 1 Box', price: 8090, game: 'Pokemon' },
  { title: 'Pokemon [en] MEGA "Ninja Splinter" 1 Box', price: 3288, game: 'Pokemon' },
];

const gameOptions: DropdownOption[] = [
  { label: 'All Games', value: 'all', shortLabel: 'All' },
  { label: 'Pokémon', value: 'pokemon' },
  { label: 'Battle of Talingchan', value: 'talingchan' },
  { label: 'One Piece', value: 'onepiece' },
];

const sortOptions: DropdownOption[] = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'In Stock First', value: 'instock' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'A-Z', value: 'az' },
  { label: 'Z-A', value: 'za' },
];

export const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') ?? '';

  const [selectedGame, setSelectedGame] = useState<DropdownOption>(gameOptions[0]);
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Search Result{query && ` : ${query}`}
        </h1>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-700 hover:text-black font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-10">
        <FilterDropdown
          label="Game:"
          options={gameOptions}
          selected={selectedGame}
          onSelect={setSelectedGame}
        />
        <FilterDropdown
          label="Sort by :"
          options={sortOptions}
          selected={selectedSort}
          onSelect={setSelectedSort}
          align="right"
        />
      </div>

      <section className="mb-12">
        <div className="relative flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Marketplace &amp; Trading</h2>
          <button className="absolute right-0 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {marketplaceListings.map((listing, i) => (
            <TradingListingCard key={i} {...listing} />
          ))}
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">Optracard Official Store</h2>

        <div className="text-left mb-10">
          <h3 className="text-xl font-bold mb-4">Single</h3>
          <div className="grid grid-cols-4 gap-4">
            {singleCards.map((card, i) => <ProductCard key={i} {...card} />)}
          </div>
        </div>

        <div className="text-left mb-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Booster</h3>
            <button className="text-blue-500 text-sm">View All →</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {boosterCards.map((card, i) => <ProductCard key={i} {...card} />)}
          </div>
        </div>

        <div className="text-left">
          <h3 className="text-xl font-bold mb-4">Booster Box</h3>
          <div className="grid grid-cols-3 gap-4">
            {boosterBoxCards.map((card, i) => <ProductCard key={i} {...card} />)}
          </div>
        </div>
      </section>
    </div>
  );
};
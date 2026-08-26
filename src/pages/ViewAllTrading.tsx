import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TradingListingCard } from '../components/TradingListingCard'; // เปลี่ยนมา import TradingListingCard
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';

type MarketplaceProduct = {
  id: number;
  title: string;
  type: string;
  price: number;
  stock: number;
};

const products: MarketplaceProduct[] = [
  { id: 1, title: 'Scarlet & Violet Booster Pack', type: 'Booster Pack', price: 120, stock: 24 },
  { id: 2, title: 'One Piece OP-09 Booster Pack', type: 'Booster Pack', price: 145, stock: 18 },
  { id: 3, title: 'Pokemon 151 Booster Box', type: 'Booster Box', price: 4_990, stock: 8 },
  { id: 4, title: 'Lorcana Into the Inklands Pack', type: 'Booster Pack', price: 160, stock: 32 },
  { id: 5, title: 'Yu-Gi-Oh! Duelist Nexus Box', type: 'Booster Box', price: 2_490, stock: 11 },
  { id: 6, title: 'Dragon Shield Matte Sleeves', type: 'Accessories', price: 290, stock: 46 },
  { id: 7, title: 'Magic: The Gathering Playmat', type: 'Accessories', price: 850, stock: 15 },
  { id: 8, title: 'Pokemon 3-Pocket Binder', type: 'Accessories', price: 590, stock: 21 },
  { id: 9, title: 'Weiss Schwarz Trial Deck', type: 'Booster Box', price: 1_290, stock: 9 },
  { id: 10, title: 'Digimon Card Game Starter Deck', type: 'Booster Box', price: 690, stock: 17 },
  { id: 11, title: 'Top Loader 35 Pack', type: 'Accessories', price: 180, stock: 64 },
  { id: 12, title: 'Card Storage Box 800 Count', type: 'Accessories', price: 390, stock: 27 },
  { id: 13, title: 'Flesh and Blood Booster Pack', type: 'Booster Pack', price: 135, stock: 19 },
  { id: 14, title: 'Pokemon Premium Collection Box', type: 'Booster Box', price: 1_890, stock: 6 },
  { id: 15, title: 'TCG Tabletop Playmat', type: 'Accessories', price: 720, stock: 13 },
];

const typeOptionsData = Array.from(new Set(products.map((product) => product.type))).sort();
const typeOptions: DropdownOption[] = [
  { label: 'All types', value: 'All', shortLabel: 'All' },
  ...typeOptionsData.map((type) => ({ label: type, value: type }))
];

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
  const [selectedType, setSelectedType] = useState<DropdownOption>(typeOptions[0]);
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleProducts = useMemo(() => {
    const filtered = selectedType.value === 'All' 
      ? [...products] 
      : products.filter((product) => product.type === selectedType.value);

    if (selectedSort.value === 'stock') return filtered.sort((a, b) => b.stock - a.stock);
    if (selectedSort.value === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (selectedSort.value === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (selectedSort.value === 'a-z') return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (selectedSort.value === 'z-a') return filtered.sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [selectedType, selectedSort]);

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
          <FilterDropdown
            label="Type:"
            options={typeOptions}
            selected={selectedType}
            onSelect={setSelectedType}
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

        {/* ปรับ Grid เป็น lg:grid-cols-3 และลบ xl:grid-cols-4 ออก เพื่อให้การ์ดแนวนอนไม่แคบเกินไป */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <TradingListingCard 
              key={product.id} 
              cardName={product.title} 
              gameName={product.type} 
              itemCount={product.stock}
              startingPrice={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
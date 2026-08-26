import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom'; // เพิ่ม useSearchParams
import { ProductCard } from '../components/ProductCard';
import { FilterDropdown, type DropdownOption } from '../components/FilterDropdown';

type Product = {
  id: number;
  title: string;
  game: string;
  price: number;
  stock: number;
};

const products: Product[] = [
  { id: 1, title: 'Charizard ex', game: 'Pokemon', price: 890, stock: 0 },
  { id: 2, title: 'Blue-Eyes White Dragon', game: 'Yu-Gi-Oh!', price: 1290, stock: 5 },
  { id: 3, title: 'Monkey D. Luffy', game: 'One Piece', price: 720, stock: 12 },
  { id: 4, title: 'Pikachu VMAX', game: 'Pokemon', price: 540, stock: 3 },
  { id: 5, title: 'Mewtwo VSTAR', game: 'Pokemon', price: 640, stock: 0 },
  { id: 6, title: 'Roronoa Zoro', game: 'One Piece', price: 460, stock: 8 },
  { id: 7, title: 'Dark Magician', game: 'Yu-Gi-Oh!', price: 980, stock: 2 },
  { id: 8, title: 'Gengar VMAX', game: 'Pokemon', price: 780, stock: 15 },
  { id: 9, title: 'Eevee Heroes', game: 'Pokemon', price: 390, stock: 20 },
  { id: 10, title: 'Trafalgar Law', game: 'One Piece', price: 520, stock: 6 },
  { id: 11, title: 'Red-Eyes B. Dragon', game: 'Yu-Gi-Oh!', price: 860, stock: 0 },
  { id: 12, title: 'Sylveon V', game: 'Pokemon', price: 430, stock: 4 },
  { id: 13, title: 'Snorlax Special Art', game: 'Pokemon', price: 610, stock: 9 },
  { id: 14, title: 'Nami Character Rare', game: 'One Piece', price: 690, stock: 7 },
  { id: 15, title: 'Exodia the Forbidden One', game: 'Yu-Gi-Oh!', price: 1450, stock: 1 },
  { id: 16, title: 'Umbreon VMAX', game: 'Pokemon', price: 1180, stock: 0 },
];

const gameOptionsData = Array.from(new Set(products.map((product) => product.game))).sort();
const gameOptions: DropdownOption[] = [
  { label: 'All games', value: 'All', shortLabel: 'All' },
  ...gameOptionsData.map((game) => ({ label: game, value: game }))
];

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
  
  // ดึงค่า type จาก URL ถ้าไม่มีค่าให้แสดงเป็น 'Single' เป็นค่าเริ่มต้น
  const productType = searchParams.get('type') || 'Single';

  const [selectedGame, setSelectedGame] = useState<DropdownOption>(gameOptions[0]);
  const [selectedSort, setSelectedSort] = useState<DropdownOption>(sortOptions[0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleProducts = useMemo(() => {
    const filtered = selectedGame.value === 'All' 
      ? [...products] 
      : products.filter((product) => product.game === selectedGame.value);

    if (selectedSort.value === 'stock') return filtered.sort((a, b) => b.stock - a.stock);
    if (selectedSort.value === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (selectedSort.value === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (selectedSort.value === 'a-z') return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (selectedSort.value === 'z-a') return filtered.sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [selectedGame, selectedSort]);

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
              {/* เปลี่ยน Breadcrumb ให้ตรงตาม URL */}
              <span className="text-[#59616d]">{productType}</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f65ff]">Card collection</p>
            {/* เปลี่ยน Title (H1) ให้ตรงตาม URL */}
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

        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              title={product.title} 
              price={product.price}
              game={product.game} 
            />
          ))}
        </div>
      </div>
    </section>
  );
}
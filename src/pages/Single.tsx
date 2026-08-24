import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

const gameOptions = Array.from(new Set(products.map((product) => product.game))).sort();

const formatPrice = (price: number) => `฿${price.toLocaleString('en-US')}`;

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ProductArtwork() {
  return (
    <div
      className="flex h-48 w-32 rotate-[-3deg] items-center justify-center bg-gray-100 shadow-[0_8px_18px_rgba(15,23,42,0.12)] transition duration-300 group-hover:rotate-0 group-hover:scale-105"
    >
      <span className="text-sm font-medium text-gray-500">[Image]</span>
    </div>
  );
}

function ProductTile({ product }: { product: Product }) {
  return (
    <article className="group flex min-h-[348px] flex-col bg-white p-3 shadow-[0_4px_18px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
      <div className="flex h-[218px] items-center justify-center bg-[#e8e9eb]">
        <ProductArtwork />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#777f8b]">{product.game}</p>
        <h2 className="mt-1 line-clamp-2 min-h-[40px] text-sm font-semibold leading-5 text-[#20242b]">{product.title}</h2>
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-base font-extrabold text-[#20242b]">{formatPrice(product.price)}</p>
          <button
            aria-label={`Add ${product.title} to cart`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#2f65ff] transition hover:bg-[#e9efff]"
            type="button"
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export function Single() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleProducts = useMemo(() => {
    const filtered = selectedGame === 'All' ? [...products] : products.filter((product) => product.game === selectedGame);

    if (sortOrder === 'stock') return filtered.sort((a, b) => b.stock - a.stock);
    if (sortOrder === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (sortOrder === 'a-z') return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'z-a') return filtered.sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [selectedGame, sortOrder]);

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
              <span className="text-[#59616d]">Single</span>
            </nav>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#2f65ff]">Card collection</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight text-[#171a20] sm:text-4xl">Single</h1>
            <p className="mt-2 text-sm text-[#777f8b]">Find the perfect card to complete your collection.</p>
          </div>

        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#777f8b]" htmlFor="game-filter">
            <span>Game</span>
            <select
              aria-label="Filter products by game"
              className="min-w-[180px] rounded border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#3b424d] outline-none transition focus:border-[#2f65ff]"
              id="game-filter"
              onChange={(event) => setSelectedGame(event.target.value)}
              value={selectedGame}
            >
              <option value="All">All games</option>
              {gameOptions.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#777f8b]" htmlFor="sort-filter">
              <span>Sort by</span>
              <select
                aria-label="Sort products"
                className="rounded border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#3b424d] outline-none transition focus:border-[#2f65ff]"
                id="sort-filter"
                onChange={(event) => setSortOrder(event.target.value)}
                value={sortOrder}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="stock">In Stock First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="a-z">A-Z</option>
                <option value="z-a">Z-A</option>
              </select>
            </label>
            <p className="text-xs font-medium text-[#9198a3]">Showing {visibleProducts.length} products</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

const typeOptions = Array.from(new Set(products.map((product) => product.type))).sort();

const formatPrice = (price: number) => `฿${price.toLocaleString('en-US')}`;

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="9" cy="20" r="1.2" fill="currentColor" />
      <circle cx="18" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ProductPlaceholder() {
  return (
    <div className="flex h-[112px] w-[88px] shrink-0 items-center justify-center bg-gray-100 transition duration-300 group-hover:rotate-[-2deg] group-hover:scale-105">
      <span className="text-xs font-medium text-gray-500">[Image]</span>
    </div>
  );
}

function ProductCard({ product }: { product: MarketplaceProduct }) {
  return (
    <article className="group grid min-h-[160px] grid-cols-[88px_minmax(0,1fr)] gap-3 border border-[#edf0f3] bg-white p-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_26px_rgba(15,23,42,0.1)]">
      <ProductPlaceholder />
      <div className="flex min-w-0 flex-col">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#89919d]">{product.type}</p>
        <h2 className="mt-1 line-clamp-2 text-xs font-semibold leading-4 text-[#20242b]">{product.title}</h2>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-sm font-extrabold text-[#20242b]">{formatPrice(product.price)}</p>
            <p className="mt-0.5 text-[10px] text-[#89919d]">Stock: {product.stock}</p>
          </div>
          <button
            aria-label={`Add ${product.title} to cart`}
            className="flex items-center gap-1 rounded-full bg-[#dce7ff] px-2.5 py-1.5 text-[10px] font-bold text-[#2f65ff] transition hover:bg-[#c8d8ff]"
            type="button"
          >
            <CartIcon />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function Marketplace() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const visibleProducts = useMemo(() => {
    const filtered = selectedType === 'All' ? [...products] : products.filter((product) => product.type === selectedType);

    if (sortOrder === 'stock') return filtered.sort((a, b) => b.stock - a.stock);
    if (sortOrder === 'price-low') return filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-high') return filtered.sort((a, b) => b.price - a.price);
    if (sortOrder === 'a-z') return filtered.sort((a, b) => a.title.localeCompare(b.title));
    if (sortOrder === 'z-a') return filtered.sort((a, b) => b.title.localeCompare(a.title));
    return filtered;
  }, [selectedType, sortOrder]);

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
          <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#777f8b]" htmlFor="type-filter">
            <span>Type</span>
            <select
              aria-label="Filter products by type"
              className="min-w-[180px] rounded border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#3b424d] outline-none transition focus:border-[#2f65ff]"
              id="type-filter"
              onChange={(event) => setSelectedType(event.target.value)}
              value={selectedType}
            >
              <option value="All">All types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <label className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#777f8b]" htmlFor="marketplace-sort-filter">
              <span>Sort by</span>
              <select
                aria-label="Sort marketplace products"
                className="rounded border border-[#dfe3e8] bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-[#3b424d] outline-none transition focus:border-[#2f65ff]"
                id="marketplace-sort-filter"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { TradingListingCard } from '../components/TradingListingCard';
import { loadCatalog as loadCatalogFromApi } from '../api/catalog';
import type { CatalogProduct, CatalogSource } from '../types/catalog';

const PRODUCT_TYPES = ['Single', 'Booster', 'Booster Box', 'Accessories'];

const sourceContent: Record<CatalogSource, { title: string; eyebrow: string; viewAll: string }> = {
  MARKETPLACE: {
    title: 'Marketplace & Trading',
    eyebrow: 'Independent seller listings',
    viewAll: '/ViewAllTrading',
  },
  OFFICIAL: {
    title: 'Optracard Official Store',
    eyebrow: 'Sold and fulfilled by Optracard',
    viewAll: '/ViewAllOOS',
  },
};

export const Home = () => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadCatalog = async () => {
      try {
        const data = await loadCatalogFromApi();
        if (isCurrent) {
          setProducts(data);
          setError(null);
        }
      } catch {
        if (isCurrent) setError('We could not load the catalog right now. Please try again shortly.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadCatalog();
    return () => { isCurrent = false; };
  }, []);

  const productsBySourceAndType = useMemo(() => {
    return (source: CatalogSource, type: string) =>
      products.filter((product) => product.source === source && product.type === type).slice(0, 4);
  }, [products]);

  const renderOfficialProductSection = (type: string) => {
    const source: CatalogSource = 'OFFICIAL';
    const catalogProducts = productsBySourceAndType(source, type);
    const destination = `/ViewAllOOS?type=${encodeURIComponent(type)}`;

    return (
      <div key={`${source}-${type}`} className="mb-10 text-left">
        <div className="flex justify-between items-center gap-4 mb-4">
          <h3 className="text-xl font-bold text-slate-900">{type}</h3>
          <Link
            to={destination}
            className="shrink-0 bg-[#1e5bff] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {catalogProducts.map((product) => (
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
      </div>
    );
  };

  const renderMarketplaceSection = () => {
    const marketplaceProducts = products.filter((product) => product.source === 'MARKETPLACE').slice(0, 9);

    return (
      <section key="MARKETPLACE" className="mb-16">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{sourceContent.MARKETPLACE.eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black text-slate-900">{sourceContent.MARKETPLACE.title}</h2>
          </div>
          <Link
            to={sourceContent.MARKETPLACE.viewAll}
            className="shrink-0 rounded-md bg-[#1e5bff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {marketplaceProducts.map((product) => (
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
        </div>
      </section>
    );
  };

  return (
    <div className="bg-slate-50">
      <section className="w-full bg-gradient-to-r from-[#082666] via-[#1649bb] to-[#2f65ff] px-6 py-14 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">Optracard marketplace</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Discover cards, sealed products and TCG essentials.</h1>
          <p className="mt-3 max-w-2xl text-base text-blue-100">Shop Optracard Official Store or listings from approved community sellers.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading && <p className="py-16 text-center text-base text-slate-500">Loading catalog...</p>}
        {error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-red-700">{error}</p>}
        {!isLoading && !error && (
          <>
            <section key="OFFICIAL" className="mb-16">
              <div className="mb-8 border-b border-slate-200 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">{sourceContent.OFFICIAL.eyebrow}</p>
                  <h2 className="mt-1 text-3xl font-black text-slate-900">{sourceContent.OFFICIAL.title}</h2>
                </div>
              </div>
              {PRODUCT_TYPES.map(renderOfficialProductSection)}
            </section>
            {renderMarketplaceSection()}
          </>
        )}
      </section>
    </div>
  );
};

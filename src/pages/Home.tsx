import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock3, Gavel } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { loadCatalogPage } from '../api/catalog';
import type { CatalogProduct, CatalogSource, CatalogQuery } from '../types/catalog';
import { loadAuctions } from '../api/auctions';
import type { Auction } from '../types/auction';
import pokemonBanner from '../assets/marketplace-pokemon-banner.png';
import auctionBanner from '../assets/marketplace-auction-banner.png';
import collectorBanner from '../assets/marketplace-collector-banner.png';
import logoIcon from '../assets/logo-icon.png';

const PRODUCT_TYPES = ['Single', 'Booster', 'Booster Box', 'Accessories'];
const normalizeFilterValue = (value: string | null | undefined) => (value ?? '').trim().toLowerCase();

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
  const [searchParams] = useSearchParams();
  const [appliedParams, setAppliedParams] = useState(() => new URLSearchParams(searchParams));
  useEffect(() => {
    if (!searchParams.has('pending')) setAppliedParams(new URLSearchParams(searchParams));
  }, [searchParams.toString()]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(() => window.sessionStorage.getItem('optracard-storefront-intro-seen') !== 'true');

  const banners = [
    {
      image: pokemonBanner,
      eyebrow: 'Optracard marketplace',
      title: 'Discover cards, sealed products and TCG essentials.',
      description: 'Shop Optracard Official Store or listings from approved community sellers.',
    },
    {
      image: auctionBanner,
      eyebrow: 'Optracard auctions',
      title: 'Bid on rare cards before the clock runs out.',
      description: 'Explore one-of-a-kind lots from verified community sellers and the Official Store.',
    },
    {
      image: collectorBanner,
      eyebrow: 'Collect, trade, discover',
      title: 'Find the next highlight of your collection.',
      description: 'Sealed products, singles, accessories and community listings in one marketplace.',
    },
  ];

  useEffect(() => {
    let isCurrent = true;

    const loadCatalog = async () => {
      try {
        const active = searchParams.has('pending') ? appliedParams : searchParams;
        const query = Object.fromEntries(active.entries()) as CatalogQuery;
        // Home renders two independent sections. Fetch each public source separately so
        // pagination of one source cannot hide the other source from the first page.
        const data = query.source
          ? (await loadCatalogPage(query)).items
          : (await Promise.all([
            loadCatalogPage({ ...query, source: 'OFFICIAL', page: '0', pageSize: '24' }),
            loadCatalogPage({ ...query, source: 'MARKETPLACE', page: '0', pageSize: '24' }),
          ])).flatMap((result) => result.items);
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
  }, [searchParams.toString(), appliedParams.toString()]);

  useEffect(() => {
    void loadAuctions({ status: 'LIVE' }).then((items) => setAuctions(items.slice(0, 6))).catch(() => setAuctions([]));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setBannerIndex((current) => (current + 1) % banners.length), 10_000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (!showIntro) return;
    window.sessionStorage.setItem('optracard-storefront-intro-seen', 'true');
    const timer = window.setTimeout(() => setShowIntro(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showIntro]);

  // Catalog responses are already filtered by the backend. Keep the client-side
  // list untouched so backend normalization (for example typo/synonym matching)
  // is not undone by a second, inconsistent filter pass in the browser.
  const filteredProducts = useMemo(() => products, [products]);

  const productsBySourceAndType = useMemo(() => {
    return (source: CatalogSource, type: string) =>
      filteredProducts.filter((product) => product.source === source && normalizeFilterValue(product.type) === normalizeFilterValue(type)).slice(0, 4);
  }, [filteredProducts]);

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    const marketplaceProducts = filteredProducts.filter((product) => product.source === 'MARKETPLACE').slice(0, 9);

    return (
      <section key="MARKETPLACE" className="mb-16">
        <div className="mb-8 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">{sourceContent.MARKETPLACE.eyebrow}</p>
            <h2 className="mt-1 text-3xl font-black text-slate-900">{sourceContent.MARKETPLACE.title}</h2>
          </div>
          <Link
            to={sourceContent.MARKETPLACE.viewAll}
            className="shrink-0 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketplaceProducts.map((product) => (
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
      </section>
    );
  };

  const currentBanner = banners[bannerIndex];
  const auctionTime = (endsAt: string) => {
    const seconds = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
    if (!seconds) return 'Ending now';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m left`;
  };

  return (
    <div className="bg-slate-50">
      {showIntro && <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[#050a18] px-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(47,101,255,0.45),transparent_42%)]" />
        <div className="relative text-center"><div className="relative mx-auto flex h-24 w-24 items-center justify-center"><div className="absolute inset-0 animate-ping rounded-[2rem] border border-blue-300/70" /><div className="absolute inset-2 animate-pulse rounded-3xl bg-blue-500/30" /><div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#2f65ff] shadow-[0_0_45px_rgba(80,130,255,0.85)]"><img src={logoIcon} alt="Optracard" className="h-10 w-10 object-contain" /></div></div><p className="mt-7 text-4xl font-black tracking-tight sm:text-5xl">Optracard</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.32em] text-blue-200">Collect · Trade · Discover</p><div className="mx-auto mt-7 flex items-center justify-center gap-1.5"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-200" /><span className="h-1.5 w-5 animate-pulse rounded-full bg-blue-400" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-200" /></div></div>
      </div>}
      <section className="relative h-[330px] overflow-hidden bg-[#081b4d] text-white sm:h-[390px]">
        <img src={currentBanner.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061431]/95 via-[#09245b]/75 to-[#061431]/10" />
        <div className="relative mx-auto flex h-[330px] max-w-7xl items-center px-6 py-14 sm:h-[390px]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">{currentBanner.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">{currentBanner.title}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-blue-100">{currentBanner.description}</p>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {banners.map((banner, index) => <button key={banner.image} type="button" onClick={() => setBannerIndex(index)} aria-label={`Show banner ${index + 1}`} className={`h-2 rounded-full transition-all duration-300 ${bannerIndex === index ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white/85'}`} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-16">
          <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Live competitive listings</p>
              <h2 className="mt-1 text-3xl font-black text-slate-900">Auctions</h2>
              <p className="mt-1 text-sm text-slate-500">Rare finds and one-of-a-kind lots. Place your bid before time runs out.</p>
            </div>
            <Link to="/auctions" className="shrink-0 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700">View All Auctions →</Link>
          </div>
          {auctions.length === 0 ? <div className="rounded-xl border border-dashed border-purple-200 bg-purple-50/50 p-7 text-sm text-purple-900">There are no live auctions right now. Check back soon for the next rare find.</div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {auctions.slice(0, 3).map((auction) => <Link key={auction.id} to={`/auctions/${auction.id}`} className="group overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-md">
              <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">{auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /> : <Gavel className="h-10 w-10 text-purple-400" />}<span className="absolute left-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">Auction</span><span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-bold text-white"><Clock3 className="h-3.5 w-3.5 text-purple-300" />{auctionTime(auction.endsAt)}</span></div>
              <div className="p-4"><p className="text-xs font-semibold text-purple-600">{auction.storeName}</p><h3 className="mt-1 line-clamp-2 font-bold text-slate-900">{auction.title}</h3><p className="mt-1 text-xs text-slate-500">{auction.game} · {auction.bidCount} bids</p><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-500">Current bid</p><p className="font-extrabold text-purple-700">฿{auction.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div><span className="text-sm font-bold text-purple-600">Bid now →</span></div></div>
            </Link>)}
          </div>}
        </section>
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
              {PRODUCT_TYPES
                .filter((type) => productsBySourceAndType('OFFICIAL', type).length > 0)
                .map(renderOfficialProductSection)}
            </section>
            {renderMarketplaceSection()}
          </>
        )}
      </section>
    </div>
  );
};

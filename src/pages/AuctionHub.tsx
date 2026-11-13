import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Gavel } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loadAuctions } from '../api/auctions';
import type { Auction } from '../types/auction';
import { AuctionCard } from '../components/AuctionCard';
import { useAuth } from '../context/AuthContext';
import { auctionTimestamp } from '../hooks/useAuctionLive';

const PAGE_SIZE = 12;
export const AuctionHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canViewMyBids = user?.role === 'USER' || user?.role === 'SELLER';
  const [params, setParams] = useSearchParams();
  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Keep the text field responsive while React Router replaces the query string.
  // Without local state, rapid typing can repeatedly read a stale URL value and
  // leave only the final character in the search query.
  const [searchQuery, setSearchQuery] = useState(() => params.get('q') ?? '');
  const get = (key: string) => params.get(key) ?? '';
  const filter = (key: string, value: string) => {
    // Search events can arrive faster than React Router renders a new
    // URLSearchParams object. Keep a current ref so typed queries retain every
    // character rather than only the final key stroke.
    const next = new URLSearchParams(paramsRef.current);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    paramsRef.current = next;
    setParams(next, { replace: true });
  };
  useEffect(() => {
    let active = true; let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try { const data = await loadAuctions(); if (active) { setAuctions(data); setError(''); } }
      catch (reason) { if (active) setError(reason instanceof Error ? reason.message : 'Could not load auctions.'); }
      finally { if (active) { setLoading(false); timer = setTimeout(() => void refresh(), 15000); } }
    };
    void refresh(); return () => { active = false; clearTimeout(timer); };
  }, []);
  const games = useMemo(() => [...new Set(auctions.map(a => a.game))].sort(), [auctions]);
  const visible = useMemo(() => {
    const term = (params.get('q') ?? '').trim().toLowerCase();
    const source = params.get('source'); const game = params.get('game'); const status = params.get('status');
    const min = params.get('min'); const max = params.get('max');
    const rows = auctions.filter(a => (!term || [a.title,a.game,a.storeName].some(v => v.toLowerCase().includes(term)))
      && (!source || a.source === source) && (!game || a.game === game) && (!status || a.status === status)
      && (!min || a.currentPrice >= Number(min)) && (!max || a.currentPrice <= Number(max)));
    const sort = params.get('sort');
    return rows.sort((a,b) => sort === 'price-asc' ? a.currentPrice-b.currentPrice : sort === 'price-desc' ? b.currentPrice-a.currentPrice
      : sort === 'ending' ? auctionTimestamp(a.endsAt)-auctionTimestamp(b.endsAt) : b.id-a.id);
  }, [auctions, params]);
  const pages = Math.max(1,Math.ceil(visible.length/PAGE_SIZE));
  const page = Math.min(pages,Math.max(1,Number(get('page')) || 1));
  const control = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
  const pageButton = 'group inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors enabled:cursor-pointer enabled:hover:border-violet-300 enabled:hover:bg-violet-50 enabled:hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed disabled:opacity-50';
  const bidsAction = 'inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold shadow-sm';
  const bidsLabel = <><Gavel aria-hidden="true" className="h-4 w-4" />My bids and wins</>;
  return <div className="mx-auto min-h-screen max-w-6xl px-5 py-10 text-slate-800">
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-6 inline-flex cursor-pointer items-center gap-2 text-xl font-bold text-slate-900 transition-colors hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
    >
      <ArrowLeft aria-hidden="true" className="h-5 w-5 stroke-[3]" />
      Back
    </button>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Auction Hub</h1>
        <p className="mt-2 text-slate-500">Bid on one-of-a-kind cards. Listings refresh automatically.</p>
      </div>
      {canViewMyBids ? (
        <Link
          to="/my-auctions"
          className={`${bidsAction} border-violet-200 bg-violet-50 text-violet-800 transition-colors hover:border-violet-400 hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600`}
        >
          {bidsLabel}
        </Link>
      ) : (
        <button type="button" disabled className={`${bidsAction} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`}>
          {bidsLabel}
        </button>
      )}
    </div>
    <div className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3 lg:grid-cols-4">
      <input aria-label="Search auctions" placeholder="Search auctions" className={control} value={searchQuery} onChange={e=>{ setSearchQuery(e.target.value); filter('q', e.target.value); }} />
      <select aria-label="Source" className={control} value={get('source')} onChange={e=>filter('source',e.target.value)}><option value="">All sources</option><option>MARKETPLACE</option><option>OFFICIAL</option></select>
      <select aria-label="Game" className={control} value={get('game')} onChange={e=>filter('game',e.target.value)}><option value="">All games</option>{games.map(g=><option key={g}>{g}</option>)}</select>
      <select aria-label="Status" className={control} value={get('status')} onChange={e=>filter('status',e.target.value)}><option value="">All statuses</option>{['SCHEDULED','LIVE','AWAITING_CHECKOUT','COMPLETED','ENDED_NO_BIDS','CHECKOUT_EXPIRED'].map(s=><option key={s}>{s}</option>)}</select>
      <input aria-label="Minimum price" placeholder="Minimum price" type="number" min="0" className={control} value={get('min')} onChange={e=>filter('min',e.target.value)} />
      <input aria-label="Maximum price" placeholder="Maximum price" type="number" min="0" className={control} value={get('max')} onChange={e=>filter('max',e.target.value)} />
      <select aria-label="Sort auctions" className={control} value={get('sort')} onChange={e=>filter('sort',e.target.value)}><option value="">Newest</option><option value="ending">Ending soon</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
    </div>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {loading ? <p className="py-16 text-center">Loading auctions...</p> : <><p role="status" className="mt-4">{visible.length} auctions</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(a=><AuctionCard key={a.id} auction={a} />)}{visible.length===0&&<p>No published auctions match your search.</p>}</div>
    <nav aria-label="Auction pages" className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <button type="button" disabled={page <= 1} onClick={() => filter('page', String(page - 1))} className={pageButton}>
        <ChevronLeft aria-hidden="true" className="h-4 w-4 motion-safe:transition-transform motion-safe:group-enabled:group-hover:-translate-x-0.5" />
        Previous
      </button>
      <span className="text-sm tabular-nums text-slate-600">Page {page} of {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => filter('page', String(page + 1))} className={pageButton}>
        Next
        <ChevronRight aria-hidden="true" className="h-4 w-4 motion-safe:transition-transform motion-safe:group-enabled:group-hover:translate-x-0.5" />
      </button>
    </nav></>}
  </div>;
};

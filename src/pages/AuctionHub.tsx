import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loadAuctions } from '../api/auctions';
import type { Auction } from '../types/auction';
import { AuctionCard } from '../components/AuctionCard';
import { auctionTimestamp } from '../hooks/useAuctionLive';

const PAGE_SIZE = 12;
export const AuctionHub = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [, tick] = useState(0);
  const get = (key: string) => params.get(key) ?? '';
  const filter = (key: string, value: string) => {
    const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page'); setParams(next, { replace: true });
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
  useEffect(() => { const timer = setInterval(() => tick(v => v + 1), 1000); return () => clearInterval(timer); }, []);
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
  return <div className="mx-auto min-h-screen max-w-6xl px-5 py-10 text-slate-800">
    <button type="button" onClick={() => navigate(-1)} className="mb-6 text-sm font-semibold">Back</button>
    <div className="flex justify-between"><h1 className="text-3xl font-bold">Auction Hub</h1><Link to="/my-auctions" className="text-blue-700 underline">My bids and wins</Link></div>
    <p className="mt-2 text-slate-500">Bid on one-of-a-kind cards. Listings refresh automatically.</p>
    <div className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3 lg:grid-cols-4">
      <input aria-label="Search auctions" placeholder="Search auctions" className={control} value={get('q')} onChange={e=>filter('q',e.target.value)} />
      <select aria-label="Source" className={control} value={get('source')} onChange={e=>filter('source',e.target.value)}><option value="">All sources</option><option>MARKETPLACE</option><option>OFFICIAL</option></select>
      <select aria-label="Game" className={control} value={get('game')} onChange={e=>filter('game',e.target.value)}><option value="">All games</option>{games.map(g=><option key={g}>{g}</option>)}</select>
      <select aria-label="Status" className={control} value={get('status')} onChange={e=>filter('status',e.target.value)}><option value="">All statuses</option>{['SCHEDULED','LIVE','AWAITING_CHECKOUT','COMPLETED','ENDED_NO_BIDS','CHECKOUT_EXPIRED'].map(s=><option key={s}>{s}</option>)}</select>
      <input aria-label="Minimum price" placeholder="Minimum price" type="number" min="0" className={control} value={get('min')} onChange={e=>filter('min',e.target.value)} />
      <input aria-label="Maximum price" placeholder="Maximum price" type="number" min="0" className={control} value={get('max')} onChange={e=>filter('max',e.target.value)} />
      <select aria-label="Sort auctions" className={control} value={get('sort')} onChange={e=>filter('sort',e.target.value)}><option value="">Newest</option><option value="ending">Ending soon</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>
    </div>
    {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    {loading ? <p className="py-16 text-center">Loading auctions...</p> : <><p role="status" className="mt-4">{visible.length} auctions</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE).map(a=><AuctionCard key={a.id} auction={a} />)}{visible.length===0&&<p>No published auctions match your search.</p>}</div>
    <nav aria-label="Auction pages" className="mt-6 flex items-center justify-center gap-4"><button disabled={page<=1} onClick={()=>filter('page',String(page-1))}>Previous</button><span>Page {page} of {pages}</span><button disabled={page>=pages} onClick={()=>filter('page',String(page+1))}>Next</button></nav></>}
  </div>;
};

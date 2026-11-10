import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { loadAuctions } from '../api/auctions';
import type { Auction } from '../types/auction';
import { AuctionCard } from '../components/AuctionCard';

export const AuctionHub = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    void loadAuctions({ source })
      .then(setAuctions)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Could not load auctions.'))
      .finally(() => setLoading(false));
  }, [source]);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(() => auctions.filter((auction) => {
    const term = query.trim().toLowerCase();
    return !term || [auction.title, auction.game, auction.storeName].some((value) => value.toLowerCase().includes(term));
  }), [auctions, query]);
  void tick;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 py-10 text-slate-800">
      <button type="button" onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm font-semibold text-slate-700 transition hover:text-slate-950">← Back</button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-600">Live bidding</p>
          <h1 className="mt-1 text-3xl font-extrabold">Auction Hub</h1>
          <p className="mt-2 text-sm text-slate-500">Bid directly on one-of-a-kind listings. The highest valid bid wins.</p>
        </div>
      </div>
      <div className="mt-7 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
        <label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search auctions" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" /></label>
        <select value={source} onChange={(event) => { setLoading(true); setSource(event.target.value); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="ALL">All sources</option><option value="MARKETPLACE">Marketplace</option><option value="OFFICIAL">Official Store</option>
        </select>
      </div>
      {error && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading ? <p className="py-16 text-center text-slate-500">Loading auctions…</p> : (
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((auction) => <AuctionCard key={auction.id} auction={auction} />)}
          {visible.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No published auctions match your search.</p>}
        </div>
      )}
    </div>
  );
};

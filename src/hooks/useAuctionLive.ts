import { useEffect, useState } from 'react';
import { loadAuction, loadAuctionBids } from '../api/auctions';
import type { Auction, AuctionBid } from '../types/auction';

export const auctionTimestamp = (value: string) => new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : value + '+07:00').getTime();
export const useAuctionLive = (id: number) => {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) { setError('Invalid auction ID.'); return; }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const load = async () => {
      try {
        const [next, history] = await Promise.all([loadAuction(id, controller.signal), loadAuctionBids(id, controller.signal)]);
        if (active) { setAuction(next); setBids(history); setError(null); }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not refresh auction.');
      } finally {
        if (active) timer = setTimeout(() => void load(), 5000);
      }
    };
    void load();
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [id, revision]);
  return { auction: auction?.id === id ? auction : null, bids, error, refresh: () => setRevision(v => v + 1) };
};

export const useAuctionClock = (endsAt: string | undefined) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = endsAt ? Math.max(0, Math.ceil((auctionTimestamp(endsAt) - now) / 1000)) : 0;
  return { remaining, label: remaining === 0 ? 'Bidding time ended' : Math.floor(remaining / 3600) + 'h ' + Math.floor(remaining % 3600 / 60) + 'm ' + remaining % 60 + 's' };
};

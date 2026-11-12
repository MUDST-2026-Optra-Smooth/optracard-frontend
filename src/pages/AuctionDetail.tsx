import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Gavel } from 'lucide-react';
import { loadAuction, loadAuctionBids, placeAuctionBid } from '../api/auctions';
import type { Auction, AuctionBid } from '../types/auction';
import { useAuth } from '../context/AuthContext';

const money = (value: number) => `฿${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const time = (value: string) => new Date(value).toLocaleString();

export const AuctionDetail = () => {
  const { id } = useParams(); const auctionId = Number(id); const navigate = useNavigate(); const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null); const [bids, setBids] = useState<AuctionBid[]>([]);
  const [amount, setAmount] = useState(''); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const load = async () => { try { const [loadedAuction, loadedBids] = await Promise.all([loadAuction(auctionId), loadAuctionBids(auctionId)]); setAuction(loadedAuction); setBids(loadedBids); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load this auction.'); } };
  useEffect(() => { if (Number.isInteger(auctionId)) void load(); }, [auctionId]);
  const minimum = useMemo(() => !auction ? 0 : auction.bidCount === 0 ? auction.startingPrice : auction.currentPrice + 50, [auction]);
  const canBid = user?.role === 'USER' || user?.role === 'SELLER';
  const bid = async (event: React.FormEvent) => { event.preventDefault(); if (!user) { navigate('/login', { state: { from: `/auctions/${auctionId}` } }); return; } setSaving(true); setError(null); try { await placeAuctionBid(auctionId, Number(amount)); setAmount(''); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Bid was not accepted.'); } finally { setSaving(false); } };
  if (!auction && !error) return <p className="p-12 text-center text-slate-500">Loading auction…</p>;
  if (!auction) return <div className="mx-auto max-w-4xl p-10"><p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p></div>;
  const isWinner = user?.userId === auction.winningUserId && auction.status === 'AWAITING_CHECKOUT';
  const isLeading = auction.status === 'LIVE' && user?.userId === auction.leadingUserId;
  return <div className="mx-auto max-w-5xl px-5 py-10 text-slate-800"><Link to="/auctions" className="text-sm font-semibold text-blue-600">← Back to Auction Hub</Link><div className="mt-5 grid gap-8 md:grid-cols-2"><div className="flex min-h-80 items-center justify-center overflow-hidden rounded-xl bg-slate-100">{auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} className="h-full w-full object-cover" /> : <Gavel className="h-14 w-14 text-slate-400" />}</div><div><p className="text-xs font-bold tracking-widest text-orange-600">{auction.source} AUCTION</p><h1 className="mt-2 text-3xl font-bold">{auction.title}</h1><p className="mt-2 text-sm text-slate-500">{auction.game} · {auction.storeName}</p><p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{auction.description || 'No additional description.'}</p><div className="mt-6 rounded-xl bg-orange-50 p-4"><p className="text-xs font-semibold text-orange-800">Current bid</p><p className="mt-1 text-3xl font-extrabold text-orange-700">{money(auction.currentPrice)}</p><p className="mt-2 text-xs text-orange-800">{auction.bidCount} bids · Ends {time(auction.endsAt)}</p></div>
    {isLeading && <div role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">You are currently the highest bidder. We will let you know if another bid overtakes yours.</div>}
    {isWinner ? <Link to={`/auctions/${auction.id}/checkout`} className="mt-4 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white">Complete auction checkout</Link> : <form onSubmit={bid} className="mt-4 space-y-3"><label className="block text-sm font-semibold">Your bid <span className="font-normal text-slate-500">(minimum {money(minimum)})</span><input required min={minimum} step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={!canBid || auction.status !== 'LIVE'} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" /></label><button disabled={saving || !canBid || auction.status !== 'LIVE'} className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? 'Submitting bid…' : !user ? 'Log in to bid' : auction.status !== 'LIVE' ? `Auction ${auction.status.replaceAll('_', ' ')}` : isLeading ? 'Raise your bid' : 'Place bid'}</button></form>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}</div></div><section className="mt-10"><h2 className="text-xl font-bold">Bid history</h2><div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">{bids.length === 0 ? <p className="p-5 text-sm text-slate-500">No bids yet. Be the first bidder.</p> : bids.map((bid) => <div key={bid.id} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"><span className="text-sm font-semibold">{bid.bidderCode}</span><span className="text-xs text-slate-500">{time(bid.createdAt)}</span><span className="font-bold text-orange-700">{money(bid.amount)}</span></div>)}</div></section></div>;
};

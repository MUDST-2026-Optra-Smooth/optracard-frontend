import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImageOff, ShieldCheck, Store } from 'lucide-react';
import { loadMyAuctions, placeAuctionBid } from '../api/auctions';
import { useAuctionLive, useAuctionClock, auctionTimestamp } from '../hooks/useAuctionLive';
import { AuctionCountdown } from '../components/AuctionCountdown';
import { useAuth } from '../context/AuthContext';

const money = (value: number) => `฿${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const time = (value: string) => new Date(auctionTimestamp(value)).toLocaleString();

const DetailFact = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg bg-slate-50 px-3 py-2.5">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
  </div>
);

export const AuctionDetail = () => {
  const { id } = useParams();
  const auctionId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { auction, bids, error: loadError, refresh } = useAuctionLive(auctionId);
  const clock = useAuctionClock(auction?.endsAt);
  const [hasBid, setHasBid] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setHasBid(false);
    if (user && ['USER', 'SELLER'].includes(user.role)) {
      void loadMyAuctions()
        .then((rows) => { if (active) setHasBid(rows.some((item) => item.id === auctionId)); })
        .catch(() => undefined);
    }
    return () => { active = false; };
  }, [auctionId, user]);

  const minimum = useMemo(() => !auction ? 0 : auction.bidCount === 0
    ? auction.startingPrice
    : auction.currentPrice + (auction.bidIncrement ?? 50), [auction]);
  const canBid = user?.role === 'USER' || user?.role === 'SELLER';

  const bid = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/auctions/${auctionId}` } });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await placeAuctionBid(auctionId, Number(amount));
      setAmount('');
      setHasBid(true);
      refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Bid was not accepted.');
    } finally {
      setSaving(false);
    }
  };

  if (!auction && !error && !loadError) return <p className="p-12 text-center text-slate-500">Loading auction…</p>;
  if (!auction) return <div className="mx-auto max-w-4xl p-10"><p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">{error || loadError}</p></div>;

  const isWinner = user?.userId === auction.winningUserId && auction.status === 'AWAITING_CHECKOUT';
  const isLeading = auction.status === 'LIVE' && user?.userId === auction.leadingUserId;
  const biddingClosed = clock.remaining === 0 || auction.status !== 'LIVE';

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 text-slate-800 sm:py-10">
      <Link to="/auctions" className="text-sm font-semibold text-blue-600 hover:text-blue-700">← Back to Auction Hub</Link>

      <section className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(420px,1.15fr)] lg:items-start">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mx-auto flex h-[350px] max-w-[360px] items-center justify-center overflow-hidden rounded-xl bg-white sm:h-[440px]">
            {auction.imageUrl
              ? <img src={auction.imageUrl} alt={auction.title} className="h-full w-full object-contain p-2" />
              : <ImageOff className="h-14 w-14 text-slate-400" />}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Review product condition and evidence before placing a bid.
          </div>
        </div>

        <div>
          <p className="text-xs font-bold tracking-widest text-orange-600">{auction.source} AUCTION</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900">{auction.title}</h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-slate-600"><Store className="h-4 w-4" />{auction.storeName} · {auction.game}</p>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{auction.description || 'No additional description.'}</p>

          <section className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-orange-800">Current bid</p>
                <p className="mt-1 text-3xl font-extrabold text-orange-700">{money(auction.currentPrice)}</p>
                <p className="mt-2 text-xs font-medium text-orange-800">{auction.bidCount} bid{auction.bidCount === 1 ? '' : 's'} · Minimum next bid {money(minimum)}</p>
              </div>
              <AuctionCountdown endsAt={auction.endsAt} className="rounded-full bg-slate-950 px-3 py-2 text-sm font-extrabold text-white [&>svg]:text-orange-300" />
            </div>
            <p className="mt-4 text-xs text-orange-800">Auction ends {time(auction.endsAt)}</p>
          </section>

          {hasBid && !isLeading && auction.status === 'LIVE' && <p role="status" className="mt-3 text-sm font-semibold text-orange-800">You have been outbid.</p>}
          {isLeading && <div role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">You are currently the highest bidder. We will let you know if another bid overtakes yours.</div>}
          {isWinner ? <Link to={`/auctions/${auction.id}/checkout`} className="mt-4 block rounded-lg bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white">Complete auction checkout</Link> : (
            <form onSubmit={bid} className="mt-5 space-y-3">
              <label className="block text-sm font-semibold">Your bid <span className="font-normal text-slate-500">(minimum {money(minimum)})</span>
                <input required min={minimum} step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={!user || !canBid || biddingClosed} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 disabled:cursor-not-allowed disabled:bg-slate-100" />
              </label>
              <button disabled={saving || (!!user && !canBid) || biddingClosed} className="w-full rounded-lg bg-orange-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                {saving ? 'Submitting bid…' : !user ? 'Log in to bid' : auction.status !== 'LIVE' ? `Auction ${auction.status.replaceAll('_', ' ')}` : isLeading ? 'Raise your bid' : 'Place bid'}
              </button>
            </form>
          )}
          {(error || loadError) && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error || loadError}</p>}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Product details</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailFact label="Card game" value={auction.game} />
          <DetailFact label="Item type" value={auction.type || 'Not specified'} />
          <DetailFact label="Condition" value={auction.cardCondition || 'Not specified'} />
          <DetailFact label="Grading" value={auction.grading || 'Ungraded / not specified'} />
        </div>
        {auction.evidenceImages && auction.evidenceImages.length > 0 && <div className="mt-5"><h3 className="text-sm font-bold text-slate-800">Evidence images</h3><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{auction.evidenceImages.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"><img src={url} alt={`Product evidence ${index + 1}`} className="h-32 w-full object-cover" /></a>)}</div></div>}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Bid history</h2>
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {bids.length === 0 ? <p className="p-5 text-sm text-slate-500">No bids yet. Be the first bidder.</p> : bids.map((bidItem) => <div key={bidItem.id} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0"><span className="text-sm font-semibold">{bidItem.bidderCode}</span><span className="text-xs text-slate-500">{time(bidItem.createdAt)}</span><span className="font-bold text-orange-700">{money(bidItem.amount)}</span></div>)}
        </div>
      </section>
    </main>
  );
};

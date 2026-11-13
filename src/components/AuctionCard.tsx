import { Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuctionCountdown } from './AuctionCountdown';
import type { Auction } from '../types/auction';

/** Shared live-auction presentation for the storefront and Auction Hub. */
export const AuctionCard = ({ auction }: { auction: Auction }) => (
  <Link
    to={`/auctions/${auction.id}`}
    className="group flex h-full flex-col overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:scale-[1.015] hover:border-purple-400 hover:shadow-md"
  >
    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
      {auction.imageUrl ? <img src={auction.imageUrl} alt={auction.title} className="h-full w-full object-contain" /> : <Gavel className="h-10 w-10 text-purple-400" />}
      <span className="absolute left-3 top-3 rounded-full bg-purple-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">Auction</span>
      <AuctionCountdown endsAt={auction.endsAt} className="absolute bottom-3 right-3 rounded-full bg-slate-950/85 px-2.5 py-1 text-xs font-bold text-white [&>svg]:text-purple-300" />
    </div>
    <div className="flex flex-grow flex-col p-4">
      <p className="text-xs font-semibold text-purple-600">{auction.storeName}</p>
      <h3 className="mt-1 line-clamp-2 font-bold text-slate-900">{auction.title}</h3>
      <p className="mt-1 text-xs text-slate-500">{auction.game} · {auction.bidCount} bids</p>
      <div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-500">Current bid</p><p className="font-extrabold text-purple-700">฿{auction.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div><span className="text-sm font-bold text-purple-600">Bid now →</span></div>
    </div>
  </Link>
);

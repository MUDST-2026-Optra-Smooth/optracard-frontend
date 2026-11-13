import { Clock3 } from 'lucide-react';
import { useAuctionClock } from '../hooks/useAuctionLive';

export const formatAuctionRemaining = (remaining: number) => {
  if (remaining <= 0) return 'Bidding ended';

  const days = Math.floor(remaining / 86_400);
  const hours = Math.floor((remaining % 86_400) / 3_600);
  const minutes = Math.floor((remaining % 3_600) / 60);
  const seconds = remaining % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
};

interface AuctionCountdownProps {
  endsAt: string;
  className?: string;
}

/** A self-updating countdown shared by the Auction Hub and Auction detail page. */
export const AuctionCountdown = ({ endsAt, className = '' }: AuctionCountdownProps) => {
  const { remaining } = useAuctionClock(endsAt);
  const ended = remaining === 0;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-label={`Time remaining: ${formatAuctionRemaining(remaining)}`}>
      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
      <span aria-hidden="true">{ended ? 'Bidding ended' : formatAuctionRemaining(remaining)}</span>
    </span>
  );
};

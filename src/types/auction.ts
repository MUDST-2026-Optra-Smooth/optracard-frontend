export type AuctionStatus =
  | 'SUSPENDED' | 'DRAFT' | 'PENDING_REVIEW' | 'SCHEDULED' | 'LIVE' | 'AWAITING_CHECKOUT'
  | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'ENDED_NO_BIDS' | 'CHECKOUT_EXPIRED' | 'CLOSED';

export interface Auction {
  bidIncrement?: number;
  checkoutHours?: number;
  antiSnipingMinutes?: number;
  id: number;
  productId?: number | null;
  cardCondition?: string | null;
  grading?: string | null;
  evidenceImages?: string[];
  title: string;
  game: string;
  type: string | null;
  imageUrl: string | null;
  description: string | null;
  startingPrice: number;
  currentPrice: number;
  bidCount: number;
  startsAt: string;
  endsAt: string;
  checkoutDeadline: string | null;
  status: AuctionStatus;
  source: 'MARKETPLACE' | 'OFFICIAL';
  storeId: number | null;
  storeName: string;
  sellerUserId: number;
  winningUserId: number | null;
  leadingUserId: number | null;
  reviewNote: string | null;
  createdAt: string;
}

export interface AuctionBid {
  id: number;
  amount: number;
  bidderCode: string;
  createdAt: string;
}

export interface AuctionInput {
  productId?: number | null;
  cardCondition?: string | null;
  grading?: string | null;
  evidenceImages?: string[];
  title: string;
  gameId: number | null;
  type: string;
  imageUrl: string;
  description: string;
  startingPrice: number;
  startsAt: string;
  endsAt: string;
}

export interface AuctionCheckoutInput {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  shippingMethod: 'PICKUP' | 'STANDARD';
  paymentMethod: string;
}

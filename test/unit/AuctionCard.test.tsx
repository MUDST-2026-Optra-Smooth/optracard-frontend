import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuctionCard } from '../../src/components/AuctionCard';
import type { Auction } from '../../src/types/auction';

const auction: Auction = {
  id: 12, title: 'Shining Charizard', game: 'Pokemon', type: 'Single', imageUrl: null,
  description: null, startingPrice: 1000, currentPrice: 1450, bidCount: 3,
  startsAt: '2026-01-01T00:00:00', endsAt: '2099-01-01T00:00:00', checkoutDeadline: null,
  status: 'LIVE', source: 'OFFICIAL', storeId: 1, storeName: 'Optracard Official Store',
  sellerUserId: 1, winningUserId: null, leadingUserId: 2, reviewNote: null, createdAt: '2026-01-01T00:00:00',
};

describe('AuctionCard', () => {
  it('renders a consistent public auction card and links to its detail page', () => {
    render(<MemoryRouter><AuctionCard auction={auction} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /shining charizard/i })).toHaveAttribute('href', '/auctions/12');
    expect(screen.getByText('Auction')).toBeInTheDocument();
    expect(screen.getByText('Optracard Official Store')).toBeInTheDocument();
    expect(screen.getByText('Pokemon · 3 bids')).toBeInTheDocument();
    expect(screen.getByText('฿1,450.00')).toBeInTheDocument();
    expect(screen.getByText('Bid now →')).toBeInTheDocument();
  });

  it('uses the supplied product image and accessible title when one exists', () => {
    render(<MemoryRouter><AuctionCard auction={{ ...auction, imageUrl: 'https://images.example/card.png' }} /></MemoryRouter>);
    expect(screen.getByRole('img', { name: 'Shining Charizard' })).toHaveAttribute('src', 'https://images.example/card.png');
  });
});

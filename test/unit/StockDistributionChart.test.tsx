import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StockDistributionChart } from '../../src/components/dashboard/StockDistributionChart';

describe('StockDistributionChart Unit Tests', () => {
  it('renders empty state when no products or counts are provided', () => {
    render(<StockDistributionChart products={[]} />);
    expect(screen.getByText('Inventory & Game Distribution')).toBeInTheDocument();
    expect(screen.getByText(/No inventory data to display/i)).toBeInTheDocument();
  });

  it('calculates in-stock, low-stock, and out-of-stock from products', () => {
    const products = [
      { game: 'Pokemon', stock: 10, active: true },
      { game: 'Pokemon', stock: 2, active: true }, // low stock (<=3)
      { game: 'One Piece', stock: 0, active: true }, // out of stock (0)
      { game: 'Yu-Gi-Oh!', stock: 5, active: true },
    ];

    render(<StockDistributionChart products={products} />);
    expect(screen.getByText('4 total product listings')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
    expect(screen.getByText('Low Stock')).toBeInTheDocument();
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByText('Pokemon')).toBeInTheDocument();
    expect(screen.getByText('One Piece')).toBeInTheDocument();
  });

  it('renders with explicit counts and catalogByGame', () => {
    render(
      <StockDistributionChart
        inStockCount={80}
        lowStockCount={15}
        outOfStockCount={5}
        catalogByGame={[
          { game: 'Pokemon', listings: 60 },
          { game: 'One Piece', listings: 40 },
        ]}
      />
    );

    expect(screen.getByText('100 total product listings')).toBeInTheDocument();
    expect(screen.getByText('80% Health')).toBeInTheDocument();
    expect(screen.getByText('Pokemon')).toBeInTheDocument();
  });
});


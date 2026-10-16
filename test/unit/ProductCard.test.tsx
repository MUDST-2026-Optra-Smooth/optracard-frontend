import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from '../../src/components/ProductCard';

// Mock AuthContext
vi.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    logout: vi.fn(),
  }),
}));

// Mock cart API
vi.mock('../../src/api/cart', () => ({
  addProductToCart: vi.fn(),
}));

describe('ProductCard unit tests', () => {
  it('renders product title, price, and game name', () => {
    render(
      <MemoryRouter>
        <ProductCard
          productId={101}
          title="Charizard VMAX"
          price={4500}
          game="Pokémon TCG"
          stock={5}
          source="OFFICIAL"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Charizard VMAX')).toBeInTheDocument();
    expect(screen.getAllByText('Pokémon TCG').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/4,500/)).toBeInTheDocument();
    expect(screen.getByText('5 in stock')).toBeInTheDocument();
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('renders marketplace badge when source is MARKETPLACE', () => {
    render(
      <MemoryRouter>
        <ProductCard
          productId={102}
          title="Blue-Eyes White Dragon"
          price={2200}
          game="Yu-Gi-Oh!"
          source="MARKETPLACE"
          storeName="Kaiba Corp"
          stock={3}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Kaiba Corp')).toBeInTheDocument();
  });

  it('displays out of stock message and disables add to cart when stock is 0', () => {
    render(
      <MemoryRouter>
        <ProductCard
          productId={103}
          title="Black Lotus"
          price={999999}
          stock={0}
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Out of stock')).toBeInTheDocument();
    const cartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(cartButton).toBeDisabled();
  });
});


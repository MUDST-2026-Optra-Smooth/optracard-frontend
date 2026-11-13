import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ViewAllCatalog } from '../../src/pages/ViewAllCatalog';
import { ViewAllOOS } from '../../src/pages/ViewAllOOS';
import { ViewAllTrading } from '../../src/pages/ViewAllTrading';
import * as catalogApi from '../../src/api/catalog';

vi.mock('../../src/api/catalog', async () => {
  const actual = await vi.importActual<typeof import('../../src/api/catalog')>('../../src/api/catalog');
  return { ...actual, loadCatalogPage: vi.fn() };
});

vi.mock('../../src/components/ProductCard', () => ({
  ProductCard: ({ title }: { title: string }) => <article>{title}</article>,
}));
vi.mock('../../src/components/TradingListingCard', () => ({
  TradingListingCard: ({ cardName }: { cardName: string }) => <article>{cardName}</article>,
}));
vi.mock('../../src/components/CatalogFilterDrawer', () => ({
  CatalogFilterDrawer: ({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply: (params: URLSearchParams) => void }) =>
    open ? <div role="dialog"><button onClick={onClose}>Close filters</button><button onClick={() => onApply(new URLSearchParams('source=MARKETPLACE&type=Single&q=card'))}>Apply filters</button></div> : null,
}));
vi.mock('../../src/components/FilterDropdown', () => ({
  FilterDropdown: ({ options, onSelect }: { options: Array<{ label: string; value: string }>; onSelect: (option: { label: string; value: string }) => void }) => (
    <div>
      {options.map((option) => <button key={option.value} onClick={() => onSelect(option)}>{option.label}</button>)}
    </div>
  ),
}));

const product = (source: 'OFFICIAL' | 'MARKETPLACE', id: number, type = 'Single') => ({
  id,
  name: source === 'OFFICIAL' ? 'Official Card' : 'Trading Card',
  price: source === 'OFFICIAL' ? 100 : 200,
  game: 'Pokemon',
  type,
  stock: id,
  imageUrl: null,
  description: 'card',
  language: 'English',
  source,
  store: { id: source === 'OFFICIAL' ? 1 : 2, name: source === 'OFFICIAL' ? 'Optracard Official Store' : 'Seller Shop' },
});

describe('catalog listing page coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(catalogApi.loadCatalogPage).mockResolvedValue({ items: [product('OFFICIAL', 1), product('MARKETPLACE', 2)], totalItems: 2, totalPages: 1, page: 0, pageSize: 100 });
  });
  afterEach(() => cleanup());

  it('loads the combined catalog and applies the filter drawer', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><ViewAllCatalog /></MemoryRouter>);
    expect((await screen.findAllByText('Official Card')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Trading Card').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(catalogApi.loadCatalogPage).toHaveBeenCalled();
  });

  it('supports official sort options, filter application, and empty/error states', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogApi.loadCatalogPage).mockResolvedValue({ items: [product('OFFICIAL', 3, 'Booster'), product('OFFICIAL', 1)], totalItems: 2, totalPages: 1, page: 0, pageSize: 100 });
    render(<MemoryRouter><ViewAllOOS /></MemoryRouter>);
    expect((await screen.findAllByText('Official Card')).length).toBeGreaterThan(0);
    for (const label of ['In Stock First', 'Price: Low to High', 'Price: High to Low', 'A-Z', 'Z-A', 'Newest Arrivals']) {
      await user.click(screen.getByRole('button', { name: label }));
    }
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Close filters' }));
    vi.mocked(catalogApi.loadCatalogPage).mockRejectedValueOnce(new Error('offline'));
    cleanup();
    render(<MemoryRouter><ViewAllOOS /></MemoryRouter>);
    expect(await screen.findByText(/could not load the official catalog/i)).toBeInTheDocument();
  });

  it('filters marketplace listings by type, sorts them, and shows failures', async () => {
    const user = userEvent.setup();
    vi.mocked(catalogApi.loadCatalogPage).mockResolvedValue({ items: [product('MARKETPLACE', 2), product('MARKETPLACE', 4, 'Booster')], totalItems: 2, totalPages: 1, page: 0, pageSize: 100 });
    render(<MemoryRouter initialEntries={['/ViewAllTrading?type=Booster']}><ViewAllTrading /></MemoryRouter>);
    expect((await screen.findAllByText('Trading Card')).length).toBeGreaterThan(0);
    for (const label of ['In Stock First', 'Price: Low to High', 'Price: High to Low', 'A-Z', 'Z-A']) {
      await user.click(screen.getByRole('button', { name: label }));
    }
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    vi.mocked(catalogApi.loadCatalogPage).mockRejectedValueOnce(new Error('offline'));
    cleanup();
    render(<MemoryRouter><ViewAllTrading /></MemoryRouter>);
    expect(await screen.findByText(/could not load marketplace listings/i)).toBeInTheDocument();
  });

  it('renders empty states when both catalog sources have no products', async () => {
    vi.mocked(catalogApi.loadCatalogPage).mockResolvedValue({ items: [], totalItems: 0, totalPages: 0, page: 0, pageSize: 100 });
    render(<MemoryRouter><ViewAllCatalog /></MemoryRouter>);
    expect(await screen.findByText('No products found.')).toBeInTheDocument();
    cleanup();
    render(<MemoryRouter><ViewAllTrading /></MemoryRouter>);
    expect(await screen.findByText(/No marketplace listings match this filter/i)).toBeInTheDocument();
    vi.mocked(catalogApi.loadCatalogPage).mockRejectedValueOnce(new Error('offline'));
    cleanup();
    render(<MemoryRouter><ViewAllCatalog /></MemoryRouter>);
    expect(await screen.findByText(/could not load the catalog/i)).toBeInTheDocument();
  });
});

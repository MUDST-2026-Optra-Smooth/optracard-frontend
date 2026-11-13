import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  invalidateCatalogCache,
  loadCatalog,
  loadCatalogFilterOptions,
  loadCatalogPage,
  loadMarketplaceStore,
  loadProduct,
  loadProductOffers,
  searchCatalog,
} from '../../src/api/catalog';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

const rawProduct = (overrides: Record<string, unknown> = {}) => ({
  id: 7,
  sku: 'PK-7',
  name: 'Pikachu ex',
  type: 'Single',
  game: 'Pokemon',
  price: 990,
  stock: 3,
  imageUrl: 'pikachu.jpg',
  description: 'Illustration rare',
  source: 'OFFICIAL',
  store: { id: 1, name: 'Optracard Official Store', slug: 'official' },
  ...overrides,
});

describe('catalog API client', () => {
  beforeEach(() => {
    invalidateCatalogCache();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('normalizes legacy and current catalog fields and caches the result', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(response([rawProduct({ source: 'MARKETPLACE' }), {
      proId: 8,
      proSku: 'OLD-8',
      proName: 'Legacy card',
      proType: 'Booster',
      cardGame: { gameName: 'One Piece' },
      proPriceOfSell: '1200',
      proQuantity: '2',
      proImageUrl: 'legacy.jpg',
      proDescription: 'Legacy description',
      proSet: 'Set A',
      proLanguage: 'Japanese',
      listingSource: 'OFFICIAL',
    }]));

    const first = await loadCatalog();
    const second = await loadCatalog();

    expect(second).toBe(first);
    expect(first[0]).toMatchObject({ id: 7, source: 'MARKETPLACE', store: { name: 'Optracard Official Store' } });
    expect(first[1]).toMatchObject({ id: 8, name: 'Legacy card', game: 'One Piece', price: 1200, stock: 2, productSet: 'Set A' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the relative catalog endpoint after the configured endpoint fails', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(response({}, 503)).mockResolvedValueOnce(response([rawProduct()]));
    await expect(loadCatalog()).resolves.toHaveLength(1);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/products/home');
  });

  it('rejects malformed catalog responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ items: [] })).mockResolvedValueOnce(response({ items: [] }));
    await expect(loadCatalog()).rejects.toThrow('Catalog response was invalid');
  });

  it('uses the search endpoint and normalizes fuzzy/synonym results from the backend', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response([rawProduct({ name: 'Pokémon booster' })]));
    const result = await searchCatalog('โปเกมอน booster');
    expect(result[0].name).toBe('Pokémon booster');
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain(encodeURIComponent('โปเกมอน booster'));
  });

  it('falls back to exact catalog matching when search endpoint is unavailable', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(response({}, 500))
      .mockResolvedValueOnce(response([rawProduct(), rawProduct({ id: 8, name: 'Blue Eyes' })]));
    const result = await searchCatalog('pikachu');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pikachu ex');
  });

  it('returns the cached catalog for an empty query', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response([rawProduct()]));
    await loadCatalog();
    await expect(searchCatalog('   ')).resolves.toHaveLength(1);
  });

  it('loads paginated catalog and filter options with query parameters', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(response({ items: [rawProduct()], page: 2, pageSize: 10, totalItems: 11, totalPages: 2, sort: 'price,asc' }))
      .mockResolvedValueOnce(response({ games: ['Pokemon'], types: ['Single'], sources: ['OFFICIAL'] }));

    const page = await loadCatalogPage({ q: 'pikachu', page: '2', pageSize: '10', sort: 'price,asc' });
    const filters = await loadCatalogFilterOptions();

    expect(page.items[0].id).toBe(7);
    expect(page.totalPages).toBe(2);
    expect(filters.games).toEqual(['Pokemon']);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('q=pikachu');
    expect(vi.mocked(fetch).mock.calls[1][0]).toContain('/filter-options');
  });

  it('throws API errors for paginated catalog and filter options', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 400));
    await expect(loadCatalogPage({})).rejects.toThrow('Catalog request failed with status 400');
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 502));
    await expect(loadCatalogFilterOptions()).rejects.toThrow('Filter options request failed with status 502');
  });

  it('loads a product directly and falls back to the catalog when it is unavailable', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(response(rawProduct({ id: 9, name: 'Direct card' })));
    await expect(loadProduct(9)).resolves.toMatchObject({ id: 9, name: 'Direct card' });

    invalidateCatalogCache();
    fetchMock.mockResolvedValueOnce(response({}, 404)).mockResolvedValueOnce(response([rawProduct()]));
    await expect(loadProduct(7)).resolves.toMatchObject({ id: 7, name: 'Pikachu ex' });

    invalidateCatalogCache();
    fetchMock.mockResolvedValueOnce(response({}, 404)).mockResolvedValueOnce(response([rawProduct()]));
    await expect(loadProduct(404)).rejects.toThrow('Product not found');
  });

  it('loads product offers or derives matching offers from the catalog', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValueOnce(response([rawProduct({ id: 7 }), rawProduct({ id: 8 })]));
    await expect(loadProductOffers(7)).resolves.toHaveLength(2);

    invalidateCatalogCache();
    fetchMock.mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response([
      rawProduct({ id: 7 }),
      rawProduct({ id: 8 }),
      rawProduct({ id: 9, game: 'One Piece' }),
    ]));
    await expect(loadProductOffers(7)).resolves.toHaveLength(2);

    invalidateCatalogCache();
    fetchMock.mockResolvedValueOnce(response({}, 500)).mockResolvedValueOnce(response([rawProduct({ id: 9 })]));
    await expect(loadProductOffers(7)).resolves.toEqual([]);
  });

  it('loads marketplace stores and maps not-found responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(response({ id: 4, storeName: 'Card Corner' }));
    await expect(loadMarketplaceStore(4)).resolves.toMatchObject({ id: 4 });
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 404));
    await expect(loadMarketplaceStore(99)).rejects.toThrow('Store not found');
    vi.mocked(fetch).mockResolvedValueOnce(response({}, 500));
    await expect(loadMarketplaceStore(99)).rejects.toThrow('Store request failed with status 500');
  });
});

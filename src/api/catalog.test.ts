import { afterEach, describe, expect, it, vi } from 'vitest';
import { invalidateCatalogCache, searchCatalog } from './catalog';

const products = [
  { id: 1, name: 'Pokemon', game: 'Pokemon', type: 'Single', price: 10 },
  { id: 2, name: 'Pokamon', game: 'Pokemon', type: 'Single', price: 20 },
];

afterEach(() => {
  invalidateCatalogCache();
  vi.unstubAllGlobals();
});

describe('searchCatalog', () => {
  it('preserves the relevance order returned by the search API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => products }));
    expect((await searchCatalog('pokamon')).map((product) => product.id)).toEqual([1, 2]);
  });

  it('returns an empty successful response without falling back', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    expect(await searchCatalog('missing')).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to exact catalog matches when search fails', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => products }));
    expect((await searchCatalog('pokamon')).map((product) => product.id)).toEqual([2]);
  });

  it('reports an error when both search and catalog fail', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(searchCatalog('pokemon')).rejects.toThrow('offline');
  });
});

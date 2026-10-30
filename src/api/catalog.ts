import type { CatalogProduct, MarketplaceStoreProfile, CatalogQuery, CatalogPage, CatalogFilterOptions } from '../types/catalog';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';
const CACHE_TTL_MS = 60_000;

let cachedCatalog: CatalogProduct[] | null = null;
let cachedAt = 0;
let catalogRequest: Promise<CatalogProduct[]> | null = null;

/**
 * Share one catalog request across React mounts and keep a short-lived cache.
 * This prevents Home -> Cart -> Home from needlessly calling the public
 * catalog endpoint again (React StrictMode also mounts pages twice in dev).
 */
export async function loadCatalog(): Promise<CatalogProduct[]> {
  const now = Date.now();
  if (cachedCatalog && now - cachedAt < CACHE_TTL_MS) return cachedCatalog;
  if (catalogRequest) return catalogRequest;

  const tryFetch = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}`);
    const data = (await response.json()) as RawBackendProduct[];
    if (!Array.isArray(data)) throw new Error('Catalog response was invalid');
    return data.map(normalizeProduct);
  };

  catalogRequest = tryFetch(`${API_BASE_URL}/api/products/home`)
    .catch(() => tryFetch('/api/products/home'))
    .then((normalized) => {
      cachedCatalog = normalized;
      cachedAt = Date.now();
      return normalized;
    })
    .catch((error) => {
      if (cachedCatalog) return cachedCatalog;
      throw error;
    })
    .finally(() => {
      catalogRequest = null;
    });

  return catalogRequest;
}

export function invalidateCatalogCache(): void {
  cachedCatalog = null;
  cachedAt = 0;
}

interface RawBackendProduct {
  id?: number;
  proId?: number;
  sku?: string | null;
  proSku?: string | null;
  name?: string;
  proName?: string;
  type?: string;
  proType?: string;
  game?: string;
  cardGame?: { gameName?: string };
  price?: number;
  proPriceOfSell?: number;
  stock?: number;
  proQuantity?: number;
  imageUrl?: string | null;
  proImageUrl?: string | null;
  description?: string | null;
  proDescription?: string | null;
  productSet?: string | null;
  proSet?: string | null;
  language?: string | null;
  proLanguage?: string | null;
  source?: string;
  listingSource?: string;
  store?: {
    id?: number | null;
    storeId?: number | null;
    name?: string;
    storeName?: string;
    slug?: string | null;
    storeSlug?: string | null;
  } | null;
}

function normalizeProduct(raw: RawBackendProduct): CatalogProduct {
  const id = raw.id ?? raw.proId ?? 0;
  const sku = raw.sku ?? raw.proSku ?? null;
  const name = raw.name ?? raw.proName ?? '';
  const type = raw.type ?? raw.proType ?? 'Single';
  const game = raw.game ?? raw.cardGame?.gameName ?? 'Uncategorized';
  const price = Number(raw.price ?? raw.proPriceOfSell ?? 0);
  const stock = Number(raw.stock ?? raw.proQuantity ?? 0);
  const imageUrl = raw.imageUrl ?? raw.proImageUrl ?? null;
  const description = raw.description ?? raw.proDescription ?? null;
  const productSet = raw.productSet ?? raw.proSet ?? null;
  const language = raw.language ?? raw.proLanguage ?? null;
  const rawSource = (raw.source ?? raw.listingSource ?? 'OFFICIAL').toUpperCase();
  const source = rawSource === 'MARKETPLACE' ? 'MARKETPLACE' : 'OFFICIAL';

  const storeRaw = raw.store;
  const storeId = storeRaw?.id ?? storeRaw?.storeId ?? null;
  const storeName = storeRaw?.name ?? storeRaw?.storeName ?? (source === 'OFFICIAL' ? 'Optracard Official Store' : 'Marketplace seller');
  const storeSlug = storeRaw?.slug ?? storeRaw?.storeSlug ?? null;

  return {
    id,
    sku,
    name,
    type,
    game,
    price,
    stock,
    imageUrl,
    description,
    productSet,
    language,
    source,
    store: {
      id: storeId,
      name: storeName,
      slug: storeSlug,
    },
  };
}

export const searchCatalog = async (query: string): Promise<CatalogProduct[]> => {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) return loadCatalog();

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Search request failed with status ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Search response was invalid');
    return data.map(normalizeProduct);
  } catch {
    // Preserve exact catalog search if the search endpoint is unavailable.
    const allProducts = await loadCatalog();
    return allProducts.filter((product) =>
      [product.name, product.game, product.type, product.description, product.store?.name]
        .some((field) => field?.toLowerCase().includes(trimmed))
    );
  }
};

export async function loadCatalogPage(query: CatalogQuery, signal?: AbortSignal): Promise<CatalogPage> {
  const params = new URLSearchParams(); Object.entries(query).forEach(([key,value]) => { if (value !== undefined && value !== '') params.set(key, value); });
  const response = await fetch(`${API_BASE_URL}/api/products/catalog?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}`);
  const data = await response.json() as { items: RawBackendProduct[]; page: number; pageSize: number; totalItems: number; totalPages: number; sort: string };
  if (!Array.isArray(data.items)) throw new Error('Catalog response was invalid');
  return { ...data, items: data.items.map(normalizeProduct) };
}

export async function loadCatalogFilterOptions(signal?: AbortSignal): Promise<CatalogFilterOptions> {
  const response = await fetch(`${API_BASE_URL}/api/products/catalog/filter-options`, { signal });
  if (!response.ok) throw new Error(`Filter options request failed with status ${response.status}`);
  return response.json() as Promise<CatalogFilterOptions>;
}

export const loadProduct = async (productId: number): Promise<CatalogProduct> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
    if (response.ok) {
      const data = await response.json();
      return normalizeProduct(data as RawBackendProduct);
    }
  } catch {
    // API request failed; fall back to catalog lookup
  }

  // Fallback: lookup in full catalog
  const allProducts = await loadCatalog();
  const matched = allProducts.find((p) => p.id === productId);
  if (matched) {
    return matched;
  }

  throw new Error('Product not found');
};

export const loadProductOffers = async (productId: number): Promise<CatalogProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/offers`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map((item) => normalizeProduct(item as RawBackendProduct));
      }
    }
  } catch {
    // API request failed; fall back to catalog matching
  }

  try {
    const allProducts = await loadCatalog();
    const current = allProducts.find((p) => p.id === productId);
    if (!current) return [];
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase() === current.name.toLowerCase() &&
        p.game.toLowerCase() === current.game.toLowerCase()
    );
  } catch {
    return [];
  }
};

export const loadMarketplaceStore = async (storeId: number): Promise<MarketplaceStoreProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/marketplace/stores/${storeId}`);
  if (response.status === 404) throw new Error('Store not found');
  if (!response.ok) throw new Error(`Store request failed with status ${response.status}`);
  return response.json() as Promise<MarketplaceStoreProfile>;
};

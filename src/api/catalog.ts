import type { CatalogProduct, MarketplaceStoreProfile } from '../types/catalog';

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

  catalogRequest = fetch(`${API_BASE_URL}/api/products/home`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Catalog request failed with status ${response.status}`);
      const data = await response.json() as CatalogProduct[];
      if (!Array.isArray(data)) throw new Error('Catalog response was invalid');
      cachedCatalog = data;
      cachedAt = Date.now();
      return data;
    })
    .catch((error) => {
      // If a refresh has a temporary network issue, preserve a catalog the
      // visitor has already seen instead of replacing Home with an error.
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

export const searchCatalog = async (query: string): Promise<CatalogProduct[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
};

export const loadProduct = async (productId: number): Promise<CatalogProduct> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
  if (response.status === 404) {
    throw new Error('Product not found');
  }
  if (!response.ok) {
    throw new Error(`Product request failed with status ${response.status}`);
  }
  return response.json() as Promise<CatalogProduct>;
};

export const loadProductOffers = async (productId: number): Promise<CatalogProduct[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products/${productId}/offers`);
  if (response.status === 404) throw new Error('Product not found');
  if (!response.ok) throw new Error(`Product offers request failed with status ${response.status}`);
  return response.json() as Promise<CatalogProduct[]>;
};

export const loadMarketplaceStore = async (storeId: number): Promise<MarketplaceStoreProfile> => {
  const response = await fetch(`${API_BASE_URL}/api/marketplace/stores/${storeId}`);
  if (response.status === 404) throw new Error('Store not found');
  if (!response.ok) throw new Error(`Store request failed with status ${response.status}`);
  return response.json() as Promise<MarketplaceStoreProfile>;
};

import type { CatalogProduct } from '../types/catalog';

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

  try {
    const response = await fetch(`${API_BASE_URL}/api/products/search?q=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        return data.map(normalizeProduct);
      }
    }
  } catch {
    // API request failed or was rejected; gracefully fall back to local catalog search
  }

  // Fallback: search over all available products from loadCatalog()
  const allProducts = await loadCatalog();
  if (!trimmed) return allProducts;

  return allProducts.filter((product) => {
    const matchesName = product.name?.toLowerCase().includes(trimmed);
    const matchesGame = product.game?.toLowerCase().includes(trimmed);
    const matchesType = product.type?.toLowerCase().includes(trimmed);
    const matchesDesc = product.description?.toLowerCase().includes(trimmed);
    const matchesStore = product.store?.name?.toLowerCase().includes(trimmed);
    return Boolean(matchesName || matchesGame || matchesType || matchesDesc || matchesStore);
  });
};

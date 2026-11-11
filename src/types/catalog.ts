export type CatalogSource = 'OFFICIAL' | 'MARKETPLACE';

export interface CatalogStore {
  id: number | null;
  name: string;
  slug: string | null;
}

export interface CatalogProduct {
  id: number;
  sku?: string | null;
  name: string;
  type: string;
  game: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  productSet: string | null;
  language: string | null;
  source: CatalogSource;
  store: CatalogStore;
}

export interface MarketplaceStoreProfile {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  profileImage: string | null;
  products: CatalogProduct[];
}

export interface CatalogQuery { q?: string; type?: string; game?: string; minPrice?: string; maxPrice?: string; language?: string; source?: CatalogSource | ''; storeId?: string; sort?: string; page?: string; pageSize?: string; }
export interface CatalogPage { items: CatalogProduct[]; page: number; pageSize: number; totalItems: number; totalPages: number; sort: string; }
export interface CatalogFilterOptions { types: string[]; games: { id: number; name: string }[]; languages: string[]; sources: CatalogSource[]; stores: { id: number; name: string }[]; price: { min: number; max: number }; }

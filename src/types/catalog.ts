export type CatalogSource = 'OFFICIAL' | 'MARKETPLACE';

export interface CatalogStore {
  id: number | null;
  name: string;
  slug: string | null;
}

export interface CatalogProduct {
  id: number;
  sku: string | null;
  name: string;
  type: string;
  game: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
  source: CatalogSource;
  store: CatalogStore;
}

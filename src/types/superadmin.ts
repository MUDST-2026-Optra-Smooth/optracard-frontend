export interface SuperAdminMonthlyMetric {
  month: string;
  revenue: number;
  orders: number;
}

export interface SuperAdminGameCount {
  game: string;
  listings: number;
}

export interface SuperAdminStorePerformance {
  storeId: number;
  storeName: string;
  ownerName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  productCount: number;
  orderCount: number;
  gmv: number;
}

export interface SuperAdminOverview {
  totalStores: number;
  approvedStores: number;
  pendingStores: number;
  listedProducts: number;
  activeListings: number;
  gmvLast30Days: number;
  ordersLast30Days: number;
  averageOrderValueLast30Days: number;
  inStockListings: number;
  lowStockListings: number;
  outOfStockListings: number;
  monthlyMetrics: SuperAdminMonthlyMetric[];
  topStores: SuperAdminStorePerformance[];
  catalogByGame: SuperAdminGameCount[];
}

export interface SuperAdminCatalogProduct {
  id: number;
  name: string;
  game: string;
  type: string;
  productSet: string | null;
  language: string | null;
  cost: number | null;
  price: number | null;
  stock: number | null;
  imageUrl: string | null;
  description: string | null;
  active: boolean;
  listingSource: 'OFFICIAL' | 'MARKETPLACE' | string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  storeId: number | null;
  storeName: string;
}

export interface SuperAdminStore {
  storeId: number;
  storeName: string;
  storeSlug: string;
  storeStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  description: string | null;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  location: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  productCount: number;
  activeProductCount: number;
  inStockProductCount: number;
  totalStock: number;
  orderCount: number;
  gmv: number;
  products: SuperAdminCatalogProduct[];
}

export interface SuperAdminTransaction {
  id: number;
  orderNumber: string;
  createdAt: string | null;
  buyerId: number;
  buyerName: string;
  storeId: number | null;
  storeName: string | null;
  source: string;
  status: string;
  paymentStatus: string | null;
  shippingMethod: string | null;
  total: number | null;
  itemCount: number;
}

export interface SuperAdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  createdAt: string | null;
  storeId: number | null;
  storeName: string | null;
  storeStatus: string | null;
}

export interface SuperAdminStaff {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  createdAt: string | null;
}

export interface CreateSuperAdminStaffInput {
  username: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

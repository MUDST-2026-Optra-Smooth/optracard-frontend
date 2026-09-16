export interface AdminProduct {
  id: number;
  name: string;
  game: string;
  type: string;
  cost: number | null;
  price: number | null;
  stock: number | null;
  imageUrl: string | null;
  productSet: string | null;
  language: string | null;
  description: string | null;
  active: boolean;
  listingSource: 'OFFICIAL' | 'MARKETPLACE';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  storeId: number | null;
  storeName: string;
}

export interface AdminProductInput {
  name: string;
  game: string;
  type: string;
  cost: number;
  price: number;
  stock: number;
  imageUrl: string | null;
  productSet: string | null;
  language: string | null;
  description: string | null;
}

export interface AdminCardGame {
  id: number;
  name: string;
}

export interface AdminOrderItem {
  productId: number;
  name: string;
  game: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  buyerId: number;
  buyerName: string;
  createdAt: string | null;
  total: number;
  source: string;
  storeId: number | null;
  storeName: string | null;
  status: string;
  paymentStatus: string | null;
  shippingMethod: string | null;
  shippingAddress: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  trackingNumber: string | null;
  items: AdminOrderItem[];
}

export interface AdminStore {
  storeId: number;
  storeSlug: string;
  storeStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  storeName: string;
  storeDescription: string | null;
  physicalStore: boolean;
  ownerName: string;
  ownerEmail: string | null;
  ownerPhone: string | null;
  bankName: string | null;
  bankBranch: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  storeAddress: string | null;
  province: string | null;
  district: string | null;
  subdistrict: string | null;
  postalCode: string | null;
  storeProfileImage: string | null;
  bankPassbookImage: string | null;
  termsAccepted: boolean;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  productCount: number;
}

export interface AdminMonthlyMetric {
  month: string;
  revenue: number;
  expenses: number;
}

export interface AdminDashboard {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalOrders: number;
  totalItems: number;
  averageOrderValue: number;
  activeOfficialProducts: number;
  activeMarketplaceProducts: number;
  pendingStoreVerifications: number;
  pendingMarketplaceRequests: number;
  lowStockProducts: number;
  monthlyMetrics: AdminMonthlyMetric[];
  recentOrders: AdminOrder[];
}

export type SellerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CardGameOption {
  id: number;
  name: string;
}

export interface SellerProduct {
  id: number;
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
  approvalStatus: SellerApprovalStatus;
  active: boolean;
  storeId: number;
  storeName: string;
}

export interface SellerOrderItem {
  productId: number;
  name: string;
  game: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  storeName: string;
}

export interface SellerOrder {
  orderId: number;
  orderNumber: string;
  buyerId: number;
  createdAt: string | null;
  total: number;
  status: string;
  paymentStatus: string;
  shippingMethod: string | null;
  shippingAddress: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  items: SellerOrderItem[];
}

export interface SellerProductInput {
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
  templateProductId?: number | null;
}

export interface SellerStoreInfo {
  storeId: number;
  storeSlug: string;
  storeStatus: string;
  storeName: string;
  storeDescription: string | null;
  physicalStore: boolean;
  ownerFirstName: string | null;
  ownerLastName: string | null;
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
}

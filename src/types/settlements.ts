export type SettlementEntryType = 'ORDER_CHARGE' | 'AUCTION_CHARGE' | 'REVERSAL';

export interface SettlementSummary {
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
}

export interface SettlementLedgerEntry {
  id: number;
  type: SettlementEntryType;
  status: string;
  sellerUserId: number;
  storeId: number;
  storeName: string;
  referenceType: 'ORDER' | 'AUCTION' | string;
  referenceId: string;
  referenceNumber: string;
  grossAmount: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  reversalOfId: number | null;
  createdAt: string;
}

export interface SettlementReport {
  summary: SettlementSummary;
  entries: SettlementLedgerEntry[];
}

export interface MarketplaceFeeConfig {
  id: number;
  feeRate: number;
  effectiveFrom: string;
  changedBy: string;
  createdAt: string;
}

export interface SettlementFilters {
  from?: string;
  to?: string;
  type?: SettlementEntryType | 'ALL';
  sellerUserId?: number;
  storeId?: number;
}

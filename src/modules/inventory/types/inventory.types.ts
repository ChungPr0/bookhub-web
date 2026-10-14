export interface StockCardEntryDto {
  id: number;
  transactionDate: string;
  documentCode: string; // PO-xxx, ORD-xxx, ADJ-xxx
  documentType: 'PURCHASE_RECEIPT' | 'CUSTOMER_ORDER' | 'STOCK_ADJUSTMENT';
  description: string;
  openingStock: number;
  quantityIn: number;
  quantityOut: number;
  closingStock: number;
}

export interface StockCardResponse {
  bookId: number;
  bookTitle: string;
  isbn: string;
  entries: StockCardEntryDto[];
}

export interface LowStockBookDto {
  bookId: number;
  title: string;
  isbn: string;
  authorName: string;
  currentStock: number;
  minThreshold: number;
  primaryImageUrl: string;
}

export interface StockAdjustmentRequest {
  bookId: number;
  actualQuantity: number;
  systemQuantity: number;
  reason: string;
}


export interface CartItemDto {
  itemId: number;
  bookId: number;
  title: string;
  authorName: string;
  primaryImageUrl: string;
  salePrice: number;
  listPrice: number;
  quantity: number;
  stockQuantity: number;
  inStock: boolean;
  selected: boolean;
}

export interface CartResponse {
  items: CartItemDto[];
  totalItems: number;
  selectableSubtotal: number;
  grandTotal: number;
}

export interface AddToCartRequest {
  bookId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
  selected?: boolean;
}

export interface MergeCartRequest {
  items: Array<{
    bookId: number;
    quantity: number;
  }>;
}

export interface WishlistItemDto {
  id: number;
  bookId: number;
  title: string;
  authorName: string;
  salePrice: number;
  listPrice: number;
  primaryImageUrl: string;
  inStock: boolean;
  addedAt: string;
}


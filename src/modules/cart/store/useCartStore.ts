import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItemDto } from '../types/cart.types';

export interface GuestCartItem {
  bookId: number;
  title: string;
  authorName: string;
  salePrice: number;
  listPrice: number;
  primaryImageUrl: string;
  quantity: number;
  selected: boolean;
  stockQuantity: number;
  inStock: boolean;
}

interface CartState {
  guestItems: GuestCartItem[];
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addGuestItem: (item: Omit<GuestCartItem, 'selected'>) => void;
  updateGuestQuantity: (bookId: number, quantity: number) => void;
  toggleGuestSelect: (bookId: number) => void;
  toggleGuestSelectAll: (selected: boolean) => void;
  removeGuestItem: (bookId: number) => void;
  clearGuestCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      guestItems: [],
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      addGuestItem: (newItem) => {
        const { guestItems } = get();
        const existing = guestItems.find((i) => i.bookId === newItem.bookId);
        if (existing) {
          const updated = guestItems.map((i) =>
            i.bookId === newItem.bookId
              ? { ...i, quantity: Math.min(99, i.quantity + newItem.quantity) }
              : i
          );
          set({ guestItems: updated, isDrawerOpen: true });
        } else {
          set({
            guestItems: [...guestItems, { ...newItem, selected: true }],
            isDrawerOpen: true,
          });
        }
      },

      updateGuestQuantity: (bookId, quantity) => {
        if (quantity < 1 || quantity > 99) return;
        const { guestItems } = get();
        const updated = guestItems.map((i) =>
          i.bookId === bookId ? { ...i, quantity } : i
        );
        set({ guestItems: updated });
      },

      toggleGuestSelect: (bookId) => {
        const { guestItems } = get();
        const updated = guestItems.map((i) =>
          i.bookId === bookId ? { ...i, selected: !i.selected } : i
        );
        set({ guestItems: updated });
      },

      toggleGuestSelectAll: (selected) => {
        const { guestItems } = get();
        const updated = guestItems.map((i) => ({ ...i, selected }));
        set({ guestItems: updated });
      },

      removeGuestItem: (bookId) => {
        const { guestItems } = get();
        set({ guestItems: guestItems.filter((i) => i.bookId !== bookId) });
      },

      clearGuestCart: () => set({ guestItems: [] }),
    }),
    {
      name: 'bookhub-guest-cart',
      partialize: (state) => ({ guestItems: state.guestItems }),
    }
  )
);

export const mapGuestItemsToCartItems = (guestItems: GuestCartItem[]): CartItemDto[] => {
  return guestItems.map((g, idx) => ({
    itemId: idx + 1,
    bookId: g.bookId,
    title: g.title,
    authorName: g.authorName,
    primaryImageUrl: g.primaryImageUrl,
    salePrice: g.salePrice,
    listPrice: g.listPrice,
    quantity: g.quantity,
    stockQuantity: g.stockQuantity,
    inStock: g.inStock,
    selected: g.selected,
  }));
};


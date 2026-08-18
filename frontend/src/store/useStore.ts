import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, User, CustomPizzaConfig } from '../types';

interface CartStore {
  items: CartItem[];
  appliedCoupon: { code: string; discountAmount: number; discountValue: number; discountType: string } | null;
  deliveryFee: number;
  isCartOpen: boolean;
  isCustomizerOpen: boolean;
  activeOrderId: string | null;
  user: User | null;
  token: string | null;

  // Actions
  addItem: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: { code: string; discountAmount: number; discountValue: number; discountType: string } | null) => void;
  setDeliveryFee: (fee: number) => void;
  setCartOpen: (open: boolean) => void;
  setCustomizerOpen: (open: boolean) => void;
  setActiveOrderId: (orderId: string | null) => void;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      deliveryFee: 6.0,
      isCartOpen: false,
      isCustomizerOpen: false,
      activeOrderId: null,
      user: null,
      token: null,

      addItem: (item) => {
        const id = `${item.product?.id || 'custom'}-${item.variant?.id || 'default'}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        const totalPrice = item.unitPrice * item.quantity;
        const newItem: CartItem = { ...item, id, totalPrice };

        set((state) => ({
          items: [...state.items, newItem],
          isCartOpen: true
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity, totalPrice: i.unitPrice * quantity } : i
          )
        }));
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null });
      },

      setCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      setDeliveryFee: (fee) => {
        set({ deliveryFee: fee });
      },

      setCartOpen: (open) => {
        set({ isCartOpen: open });
      },

      setCustomizerOpen: (open) => {
        set({ isCustomizerOpen: open });
      },

      setActiveOrderId: (orderId) => {
        set({ activeOrderId: orderId });
      },

      setUser: (user, token) => {
        set((state) => ({
          user,
          token: token !== undefined ? token : state.token
        }));
      },

      logout: () => {
        set({ user: null, token: null });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, i) => sum + i.totalPrice, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().appliedCoupon?.discountAmount || 0;
        const delivery = get().deliveryFee;
        return Math.max(0, subtotal + delivery - discount);
      }
    }),
    {
      name: 'instalivre-pizza-storage',
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        activeOrderId: state.activeOrderId,
        user: state.user,
        token: state.token
      })
    }
  )
);

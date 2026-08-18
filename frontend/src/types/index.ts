export type OrderStatus =
  | 'RECEIVED'
  | 'PREPARING'
  | 'BAKING'
  | 'READY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELED';

export interface ProductVariant {
  id: string;
  name: string;
  sizeSlices: number;
  priceMultiplier: number;
  isDefault: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  image: string;
  isCustomizable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isChefSpecial: boolean;
  isAvailable: boolean;
  ingredients?: string;
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  products: Product[];
}

export interface Ingredient {
  id: string;
  name: string;
  category: 'BASE' | 'SAUCE' | 'CHEESE' | 'PROTEIN' | 'VEGGIE' | 'CRUST' | 'FINISH';
  price: number;
  image?: string;
  isAvailable: boolean;
}

export interface CustomPizzaConfig {
  isHalfHalf?: boolean;
  firstFlavorName?: string;
  secondFlavorName?: string;
  firstFlavorPrice?: number;
  secondFlavorPrice?: number;
  doughType?: string;
  crustType?: string;
  crustPrice?: number;
  addedToppings?: string[];
  removedToppings?: string[];
  variantName?: string;
}

export interface CartItem {
  id: string; // unique item cart instance id
  product?: Product;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customConfig?: CustomPizzaConfig;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  product?: Product;
  variantId?: string;
  variant?: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customConfig?: string | null;
  notes?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  changedBy?: string | null;
  createdAt: string;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  courierId: string;
  currentLat: number;
  currentLng: number;
  speed?: number;
  heading?: number;
  status: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'PIX' | 'CREDIT_CARD' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentDetails?: string | null;
  deliveryAddress: string;
  notes?: string | null;
  estimatedTime: number;
  courierId?: string | null;
  courier?: { id: string; name: string; phone?: string | null } | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
  deliveryTrack?: DeliveryTracking | null;
  review?: Review | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT' | 'KITCHEN' | 'COURIER' | 'ADMIN';
  phone?: string | null;
  points: number;
}

export interface Review {
  id: string;
  orderId: string;
  userId?: string | null;
  user?: { name: string } | null;
  order?: { orderNumber: number } | null;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stockOnHand: number;
  reserved: number;
};

export type DiscountType =
  | "percentage_cart"
  | "fixed_cart"
  | "bulk_product"
  | "product_percentage";

export type Discount = {
  id: string;
  name: string;
  description: string;
  type: DiscountType;
  active: boolean;
  value: number;
  thresholdCents?: number;
  productId?: string;
  minQuantity?: number;
};

export type Cart = {
  id: string;
  items: Record<string, number>;
  createdAt: number;
  lastActivityAt: number;
};

export type CartLine = {
  productId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type CartView = {
  cartId: string;
  itemCount: number;
  subtotalCents: number;
  lines: CartLine[];
  expiresAt: number;
};

export type AppliedDiscount = {
  discountId: string;
  name: string;
  amountCents: number;
};

export type CheckoutSuccess = {
  success: true;
  orderId: string;
  cartId: string;
  subtotalCents: number;
  discountTotalCents: number;
  totalCents: number;
  lines: CartLine[];
  appliedDiscounts: AppliedDiscount[];
  purchasedAt: string;
};

export type CheckoutFailure = {
  success: false;
  reason: string;
  stockIssues?: Array<{
    productId: string;
    requested: number;
    available: number;
  }>;
};

export type CheckoutResult = CheckoutSuccess | CheckoutFailure;

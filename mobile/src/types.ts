export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  stockOnHand: number;
  reserved: number;
  availableStock: number;
};

export type Discount = {
  id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
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

export type CheckoutSuccess = {
  success: true;
  orderId: string;
  cartId: string;
  subtotalCents: number;
  discountTotalCents: number;
  totalCents: number;
  lines: CartLine[];
  appliedDiscounts: Array<{
    discountId: string;
    name: string;
    amountCents: number;
  }>;
  purchasedAt: string;
};

export type StockIssue = {
  productId: string;
  requested: number;
  available: number;
};

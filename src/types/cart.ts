export interface CartItem {
  productId: number;
  quantity: number;
  addedAt: string;
}

export interface CartLineView {
  product: import('./product').Product;
  quantity: number;
  lineTotal: number;
}

export class OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  productName: string;
  productDescription?: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

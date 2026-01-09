import { api } from "./api";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentType = "CREDIT_CARD" | "DEBIT_CARD" | "CASH" | "PIX";

export type AddressType = "HOME" | "WORK" | "OTHER";

export type Address = {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  type: AddressType;
  latitude: number;
  longitude: number;
};

export type PaymentMethod = {
  id: string;
  type: PaymentType;
  lastFourDigits?: string;
};

export type OrderItem = {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  observations?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
};

export type OrderListResponse = {
  data: Order[];
  pages: number;
  totalPages: number;
};

export type DashboardMetrics = {
  todayOrders: number;
  activeOrders: number;
  readyOrders: number;
  todayRevenue: number;
};

export async function listRestaurantOrders(
  restaurantId: string,
  {
    page = 1,
    limit = 10,
    status,
  }: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  } = {}
): Promise<OrderListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) params.append("status", status);

  return api<OrderListResponse>(
    `/restaurants/${restaurantId}/orders?${params.toString()}`,
    { cache: "no-store" }
  );
}

export async function acceptOrder(
  restaurantId: string,
  orderId: string
): Promise<Order> {
  return api<Order>(`/restaurants/${restaurantId}/orders/${orderId}/accept`, {
    method: "PATCH",
  });
}

export async function rejectOrder(
  restaurantId: string,
  orderId: string,
  reason: string
): Promise<Order> {
  return api<Order>(`/restaurants/${restaurantId}/orders/${orderId}/reject`, {
    method: "PATCH",
    body: { rejectionReason: reason },
  });
}

export async function markOrderReady(
  restaurantId: string,
  orderId: string
): Promise<Order> {
  return api<Order>(`/restaurants/${restaurantId}/orders/${orderId}/ready`, {
    method: "PATCH",
  });
}

// Helper para calcular métricas do dashboard
export function calculateMetrics(orders: Order[]): DashboardMetrics {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const activeOrders = orders.filter(
    (order) => order.status === "PENDING" || order.status === "PREPARING"
  );

  const readyOrders = orders.filter((order) => order.status === "READY");

  const todayRevenue = todayOrders
    .filter((order) => order.status !== "CANCELLED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    todayOrders: todayOrders.length,
    activeOrders: activeOrders.length,
    readyOrders: readyOrders.length,
    todayRevenue,
  };
}

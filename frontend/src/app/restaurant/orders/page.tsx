import { requireAuth } from "@/lib/auth-utils";
import { listRestaurantOrders } from "@/lib/service/restaurant-orders";
import { getMyRestaurant } from "@/lib/service/restaurants";
import { OrdersListClient } from "./orders-list-client";

type OrdersPageProps = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

export default async function RestaurantOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireAuth();

  const restaurant = await getMyRestaurant();

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-red-600">
          Erro: restaurante não associado a este usuário. Crie o cadastro do
          restaurante ou contate o suporte.
        </p>
      </div>
    );
  }

  const restaurantId = restaurant.id;

  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) > 0 ? Number(resolvedParams?.page) : 1;
  const statusFilter = resolvedParams?.status as
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | undefined;

  const { data: orders, totalPages } = await listRestaurantOrders(restaurantId, {
    page,
    limit: 10,
    status: statusFilter,
  });

  return (
    <div className="container mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600">
          Gerencie todos os pedidos do restaurante
        </p>
      </div>

      <OrdersListClient
        initialOrders={orders}
        restaurantId={restaurantId}
        currentPage={page}
        totalPages={totalPages}
        currentStatus={statusFilter}
      />
    </div>
  );
}

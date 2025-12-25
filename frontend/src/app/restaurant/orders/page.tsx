import { requireRole } from "@/lib/auth-utils";
import { cookies } from "next/headers";
import { listRestaurantOrders } from "@/lib/service/restaurant-orders";
import { OrdersListClient } from "./orders-list-client";

type OrdersPageProps = {
  searchParams?: {
    page?: string;
    status?: string;
  };
};

export default async function RestaurantOrdersPage({
  searchParams,
}: OrdersPageProps) {
  await requireRole(["RESTAURANT"]);

  // Get restaurantId from user-info cookie
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get("user-info");
  if (!userInfoCookie) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-red-600">
          Erro: informações do usuário não encontradas
        </p>
      </div>
    );
  }

  const userInfo = JSON.parse(decodeURIComponent(userInfoCookie.value));
  const restaurantId = userInfo.restaurantId;

  if (!restaurantId) {
    return (
      <div className="container mx-auto px-4 py-10">
        <p className="text-red-600">
          Erro: restaurante não associado ao usuário
        </p>
      </div>
    );
  }

  const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
  const statusFilter = searchParams?.status as
    | "PENDING"
    | "PREPARING"
    | "READY"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | undefined;

  const { orders, totalPages } = await listRestaurantOrders(restaurantId, {
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

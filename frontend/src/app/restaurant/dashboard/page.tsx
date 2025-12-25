import { requireRole } from "@/lib/auth-utils";
import {
  listRestaurantOrders,
  calculateMetrics,
} from "@/lib/service/restaurant-orders";
import { getMyRestaurant } from "@/lib/service/restaurants";
import { formatMoneyFromCents } from "@/lib/utils/format";
import Link from "next/link";
import { RestaurantOrdersClient } from "./restaurant-orders-client";

export default async function RestaurantDashboardPage() {
  await requireRole(["RESTAURANT"]);

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

  // Fetch all orders to calculate metrics and show active ones
  const { data: orders } = await listRestaurantOrders(restaurantId, { limit: 100 });

  const metrics = calculateMetrics(orders);
  const activeOrders = orders.filter(
    (order) => order.status === "PENDING" || order.status === "PREPARING"
  );

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard do Restaurante
        </h1>
        <p className="text-gray-600">Gerencie seus pedidos e cardápio</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Pedidos Hoje</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {metrics.todayOrders}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            Pedidos Ativos
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {metrics.activeOrders}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">
            Pedidos Prontos
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {metrics.readyOrders}
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Vendas Hoje</div>
          <div className="mt-2 text-3xl font-bold text-gray-900">
            {formatMoneyFromCents(metrics.todayRevenue)}
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            🔔 Pedidos Ativos
          </h2>
          <Link
            href="/restaurant/orders"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Ver todos os pedidos →
          </Link>
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            Nenhum pedido ativo no momento
          </div>
        ) : (
          <RestaurantOrdersClient
            initialOrders={activeOrders}
            restaurantId={restaurantId}
          />
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/restaurant/menu"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-xl font-bold text-gray-900">
            🍕 Gerenciar Cardápio
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Adicionar, editar ou desativar categorias e itens do menu
          </p>
        </Link>
        <Link
          href="/restaurant/orders"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="text-xl font-bold text-gray-900">
            📋 Histórico de Pedidos
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Visualizar todos os pedidos, filtrar por status e exportar
            relatórios
          </p>
        </Link>
      </div>
    </div>
  );
}

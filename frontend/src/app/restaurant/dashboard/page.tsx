import { requireRole } from "@/lib/auth-utils";

export default async function RestaurantDashboardPage() {
  await requireRole(["RESTAURANT"]);

  return (
    <div className="container mx-auto px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard do Restaurante</h1>
      <p className="text-gray-600">
        TODO: fila de pedidos (GET /restaurants/:restaurantId/orders) com ações de aceitar/rejeitar/ready
        e gestão de cardápio (categorias/itens, toggle active/availability).
      </p>
    </div>
  );
}

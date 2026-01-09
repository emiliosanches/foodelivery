import { requireAuth } from "@/lib/auth-utils";

export default async function OrdersPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Meus Pedidos</h1>
      <p className="text-gray-600">
        TODO: listar pedidos de /customers/me/orders com status, valores e links para detalhe.
      </p>
    </div>
  );
}

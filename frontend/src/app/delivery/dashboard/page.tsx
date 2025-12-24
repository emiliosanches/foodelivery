import { requireRole } from "@/lib/auth-utils";

export default async function DeliveryDashboardPage() {
  await requireRole(["DELIVERY"]);

  return (
    <div className="container mx-auto px-4 py-10 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard do Entregador</h1>
      <p className="text-gray-600">
        TODO: perfil de entregador (/users/me/delivery-profile), lista de entregas e ações accept/pickup/deliver,
        além de envio periódico de localização (/location) e consumo de eventos em tempo real.
      </p>
    </div>
  );
}

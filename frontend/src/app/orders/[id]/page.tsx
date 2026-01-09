import { requireAuth } from "@/lib/auth-utils";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  await requireAuth();
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Pedido {id}</h1>
      <p className="text-gray-600">
        TODO: timeline de status, itens, pagamento e integração em tempo real via WebSocket (/events)
        com fallback de polling para /orders/:id.
      </p>
    </div>
  );
}

import { requireAuth } from "@/lib/auth-utils";

export default async function CheckoutPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>
      <p className="text-gray-600">
        TODO: seleção de endereço (/addresses), pagamento (/payment-methods), resumo do pedido e
        server action para POST /orders com observações/taxa/tempo do restaurante.
      </p>
    </div>
  );
}

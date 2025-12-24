import { requireAuth } from "@/lib/auth-utils";

export default async function CartPage() {
  await requireAuth();

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Carrinho</h1>
      <p className="text-gray-600">TODO: itens selecionados, totais em centavos, ações de quantidade/remover.</p>
    </div>
  );
}

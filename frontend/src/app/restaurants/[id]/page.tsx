interface RestaurantPageProps {
  params: { id: string };
}

export default function RestaurantDetailPage({ params }: RestaurantPageProps) {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Restaurante {params.id}</h1>
        <p className="text-gray-600">
          TODO: detalhes do restaurante, categorias e itens via /restaurants/:id,
          /restaurants/:id/categories e /restaurants/:id/menu-items; mostrar tempo
          e taxas, disponibilidade e CTA para adicionar ao carrinho.
        </p>
      </div>
    </div>
  );
}

import RestaurantCard from "@/components/restaurants/restaurant-card";
import { listRestaurants } from "@/lib/service/restaurants";

type RestaurantsPageProps = {
  searchParams?: {
    page?: string;
  };
};

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const page = Number(searchParams?.page) > 0 ? Number(searchParams?.page) : 1;
  const limit = 12;

  const { restaurants, totalPages } = await listRestaurants({ page, limit });

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Restaurantes</h1>
        <p className="text-gray-600">Explore restaurantes na sua cidade</p>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
          Nenhum restaurante disponível no momento.
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-700">
            <span>
              Página {page} de {Math.max(totalPages, 1)}
            </span>
            <div className="flex gap-2">
              <a
                href={hasPrev ? `/restaurants?page=${page - 1}` : "#"}
                className={`rounded-md border px-3 py-1 ${
                  hasPrev
                    ? "text-gray-700 hover:bg-gray-50"
                    : "cursor-not-allowed text-gray-400 bg-gray-50"
                }`}
                aria-disabled={!hasPrev}
              >
                Anterior
              </a>
              <a
                href={hasNext ? `/restaurants?page=${page + 1}` : "#"}
                className={`rounded-md border px-3 py-1 ${
                  hasNext
                    ? "text-gray-700 hover:bg-gray-50"
                    : "cursor-not-allowed text-gray-400 bg-gray-50"
                }`}
                aria-disabled={!hasNext}
              >
                Próxima
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

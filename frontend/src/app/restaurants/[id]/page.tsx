import Image from "next/image";
import {
  getRestaurant,
  listCategories,
  listMenuItems,
  type Category,
  type MenuItem,
} from "@/lib/service/restaurants";

type RestaurantPageProps = {
  params: { id: string };
};

function formatMoneyFromCents(value: number): string {
  const amount = value / 100;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function groupItemsByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.categoryId]) acc[item.categoryId] = [];
    acc[item.categoryId].push(item);
    return acc;
  }, {});
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantPageProps) {
  const [restaurant, categories, menuItems] = await Promise.all([
    getRestaurant(params.id),
    listCategories(params.id),
    listMenuItems(params.id),
  ]);

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center space-y-3">
          <h1 className="text-2xl font-bold">Restaurante não encontrado</h1>
          <p className="text-gray-600">
            Verifique o link ou escolha outro restaurante.
          </p>
        </div>
      </div>
    );
  }

  const activeCategories = categories.filter((category) => category.isActive);
  const activeItems = menuItems.filter(
    (item) => item.isActive && item.isAvailable
  );
  const itemsByCategory = groupItemsByCategory(activeItems);

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <header className="space-y-4">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-gray-100">
          {restaurant.imageUrl ? (
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 100vw"
              priority
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200"
              aria-hidden
            />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-gray-700 max-w-3xl">{restaurant.description}</p>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              Taxa: {formatMoneyFromCents(restaurant.deliveryFee)}
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1">
              {restaurant.deliveryTimeMin} - {restaurant.deliveryTimeMax} min
            </span>
            {!restaurant.isActive && (
              <span className="rounded-full bg-red-100 text-red-700 px-3 py-1">
                Indisponível
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="space-y-6">
        {activeCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
            Nenhuma categoria disponível.
          </div>
        ) : (
          activeCategories.map((category: Category) => {
            const items = itemsByCategory[category.id] || [];
            return (
              <div key={category.id} className="space-y-3">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-600 text-sm">
                      {category.description}
                    </p>
                  )}
                </div>

                {items.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhum item disponível nesta categoria.
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 p-4 bg-white"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <span className="text-sm font-medium text-gray-900">
                              {formatMoneyFromCents(item.price)}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.preparationTimeMin && (
                            <p className="text-xs text-gray-500">
                              Preparo: {item.preparationTimeMin} min
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

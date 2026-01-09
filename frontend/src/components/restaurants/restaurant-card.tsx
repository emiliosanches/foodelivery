import Image from "next/image";
import Link from "next/link";
import type { Restaurant } from "@/lib/service/restaurants";

function formatMoneyFromCents(value: number): string {
  const amount = value / 100;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-40 w-full overflow-hidden rounded-t-xl bg-gray-100">
        {restaurant.imageUrl ? (
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200"
            aria-hidden
          />
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {restaurant.name}
          </h3>
          {restaurant.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {restaurant.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-gray-700">
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

        <Link
          href={`/restaurants/${restaurant.id}`}
          className="inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Ver restaurante →
        </Link>
      </div>
    </div>
  );
}

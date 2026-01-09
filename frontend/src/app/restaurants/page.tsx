import CityRestaurants from "@/components/restaurants/city-restaurants";

type RestaurantsPageProps = {
  searchParams?: Promise<{
    page?: string;
  }>;
};

export default async function RestaurantsPage({}: RestaurantsPageProps) {
  return (
    <div className="container mx-auto px-4 py-10 space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Restaurantes</h1>
        <p className="text-gray-600">Explore restaurantes na sua cidade</p>
      </div>

      <CityRestaurants />
    </div>
  );
}

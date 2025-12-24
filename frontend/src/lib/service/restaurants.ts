import { api } from "./api";

export type Restaurant = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  isActive: boolean;
};

export type Category = {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
};

export type MenuItem = {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isActive: boolean;
  isAvailable: boolean;
  preparationTimeMin?: number;
};

export type RestaurantListResponse = {
  restaurants: Restaurant[];
  total: number;
  totalPages: number;
};

export async function listRestaurants({
  page = 1,
  limit = 12,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<RestaurantListResponse> {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return api<RestaurantListResponse>(`/restaurants?${search.toString()}`, {
    cache: "no-store",
  });
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  return api<Restaurant | null>(`/restaurants/${id}`, { cache: "no-store" });
}

export async function listCategories(
  restaurantId: string
): Promise<Category[]> {
  return api<Category[]>(`/restaurants/${restaurantId}/categories`, {
    cache: "no-store",
  });
}

export async function listMenuItems(restaurantId: string): Promise<MenuItem[]> {
  return api<MenuItem[]>(`/restaurants/${restaurantId}/menu-items`, {
    cache: "no-store",
  });
}

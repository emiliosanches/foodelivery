// Browser-safe restaurant service (no next/headers)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

import type { RestaurantListResponse } from "../restaurants";

export async function listRestaurantsByCityClient(
  city: string,
  {
    page = 1,
    limit = 12,
  }: {
    page?: number;
    limit?: number;
  } = {}
): Promise<RestaurantListResponse> {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const url = `${API_BASE_URL}/restaurants/search/city/${encodeURIComponent(
    city
  )}?${search.toString()}`;

  const res = await fetch(url, {
    // Include cookies (e.g., httpOnly auth token) when same-origin or CORS allows credentials
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    // Graceful fallback to empty list
    return { restaurants: [], total: 0, totalPages: 1 };
  }
  return (await res.json()) as RestaurantListResponse;
}

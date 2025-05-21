import { cookies } from "next/headers";
import { ApiError } from "./api-error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
};

export async function api<ResponseType = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ResponseType> {
  const { method = "GET", body, headers = {}, cache, next } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
    next,
  };

  if (body && method !== "GET") {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    let errorData;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    throw new ApiError(
      response.status,
      errorData.message || `API request failed with status ${response.status}`,
      errorData,
    );
  }

  if (response.status === 204) {
    return {} as ResponseType;
  }

  return await response.json();
}

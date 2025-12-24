// Client-side helpers to resolve location and Brazilian cities via public APIs

export type ReverseGeocodeResult = {
  city?: string;
  state?: string;
};

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        // Prefer Portuguese naming when available
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const addr = data?.address || {};
    // Nominatim keys can vary: city, town, village, municipality
    const city =
      addr.city || addr.town || addr.village || addr.municipality || undefined;
    const state = addr.state || addr.region || addr.county || undefined;
    return { city, state };
  } catch {
    return {};
  }
}

export type IbgeState = {
  id: number;
  sigla: string; // UF (e.g., SP)
  nome: string; // Nome do estado
};

export type IbgeCity = {
  id: number;
  nome: string; // Nome do município
};

export async function listBrazilStates(): Promise<IbgeState[]> {
  const url =
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome";
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) return [];
  return (await res.json()) as IbgeState[];
}

export async function listBrazilCitiesByState(
  ufIdOrSigla: string | number
): Promise<IbgeCity[]> {
  const base = "https://servicodados.ibge.gov.br/api/v1/localidades";

  // IBGE supports both state id and UF sigla for nested routes; prefer id when provided
  const path =
    typeof ufIdOrSigla === "number"
      ? `estados/${ufIdOrSigla}`
      : `estados/${ufIdOrSigla}`;
  const url = `${base}/${path}/municipios?orderBy=nome`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as IbgeCity[];
}

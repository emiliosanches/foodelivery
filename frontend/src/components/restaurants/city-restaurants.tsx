"use client";

import { useEffect, useMemo, useState } from "react";
import RestaurantCard from "./restaurant-card";
import type {
  Restaurant,
  RestaurantListResponse,
} from "@/lib/service/restaurants";
import { listRestaurantsByCityClient } from "@/lib/service/client/restaurants-client";
import {
  reverseGeocode,
  listBrazilStates,
  listBrazilCitiesByState,
  IbgeState,
  IbgeCity,
} from "@/lib/service/location";

type Status = "loading" | "denied" | "ready";

export default function CityRestaurants() {
  const [status, setStatus] = useState<Status>("loading");
  const [city, setCity] = useState<string>("");
  const [uf, setUf] = useState<string>("");

  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeCity[]>([]);

  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(false);

  const hasPrev = useMemo(() => page > 1, [page]);
  const hasNext = useMemo(() => page < totalPages, [page, totalPages]);

  // Try to get geolocation on mount
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("denied");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const info = await reverseGeocode(latitude, longitude);
        if (info.city) {
          setCity(info.city);
          setStatus("ready");
        } else {
          setStatus("denied");
        }
      },
      () => {
        setStatus("denied");
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );

    return () => {
      // no-op; using single call not watchPosition
    };
  }, []);

  // When city becomes available, load restaurants
  useEffect(() => {
    const run = async () => {
      if (!city) return;
      setLoadingList(true);
      try {
        const res: RestaurantListResponse = await listRestaurantsByCityClient(
          city,
          {
            page,
            limit,
          }
        );

        setRestaurants(res.restaurants);
        setTotalPages(res.totalPages || 1);
      } finally {
        setLoadingList(false);
      }
    };
    run();
  }, [city, page, limit]);

  // Load states for manual selection
  useEffect(() => {
    const run = async () => {
      if (status !== "denied") return;
      const s = await listBrazilStates();
      // Sort by name just in case
      setStates(s.sort((a, b) => a.nome.localeCompare(b.nome)));
    };
    run();
  }, [status]);

  // Load cities when UF changes
  useEffect(() => {
    const run = async () => {
      if (!uf) return;
      const cs = await listBrazilCitiesByState(uf);
      setCities(cs);
    };
    run();
  }, [uf]);

  const handleSearchManual = async () => {
    if (!city) return;
    setPage(1);
    setStatus("ready");
  };

  return (
    <div className="space-y-6">
      {/* Status: Loading location */}
      {status === "loading" && (
        <div className="rounded-lg border border-gray-200 p-6 text-gray-700">
          Detectando sua localização…
        </div>
      )}

      {/* Manual selection (permission denied or not available) */}
      {status === "denied" && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700">
            Não foi possível obter sua localização. Selecione seu estado e
            cidade:
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado (UF)
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
                value={uf}
                onChange={(e) => setUf(e.target.value)}
              >
                <option value="">Selecione</option>
                {states.map((s) => (
                  <option key={s.id} value={s.sigla}>
                    {s.nome} ({s.sigla})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cidade
              </label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={!uf}
              >
                <option value="">Selecione</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.nome}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:bg-gray-300"
              onClick={handleSearchManual}
              disabled={!city}
            >
              Buscar restaurantes
            </button>
            <button
              className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => setStatus("loading")}
            >
              Tentar novamente obter localização
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {status === "ready" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-700">
              Listando restaurantes em{" "}
              <span className="font-semibold">{city}</span>
            </p>
            <div className="flex items-center gap-2 text-sm">
              <button
                className="rounded-md border px-3 py-1 text-gray-700 hover:bg-gray-50"
                onClick={() => setStatus("denied")}
              >
                Alterar cidade
              </button>
            </div>
          </div>

          {loadingList ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-700">
              Carregando restaurantes…
            </div>
          ) : restaurants.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
              Nenhum restaurante disponível em {city}.
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
                  <button
                    className={`rounded-md border px-3 py-1 ${
                      hasPrev
                        ? "text-gray-700 hover:bg-gray-50"
                        : "cursor-not-allowed text-gray-400 bg-gray-50"
                    }`}
                    onClick={() =>
                      hasPrev && setPage((p) => Math.max(1, p - 1))
                    }
                    disabled={!hasPrev}
                  >
                    Anterior
                  </button>
                  <button
                    className={`rounded-md border px-3 py-1 ${
                      hasNext
                        ? "text-gray-700 hover:bg-gray-50"
                        : "cursor-not-allowed text-gray-400 bg-gray-50"
                    }`}
                    onClick={() => hasNext && setPage((p) => p + 1)}
                    disabled={!hasNext}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

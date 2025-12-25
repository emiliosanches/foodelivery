"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/service/restaurant-orders";
import OrderCard from "@/components/restaurant/order-card";

type OrdersListClientProps = {
  initialOrders: Order[];
  restaurantId: string;
  currentPage: number;
  totalPages: number;
  currentStatus?: OrderStatus;
};

const statusFilters: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "PREPARING", label: "Preparando" },
  { value: "READY", label: "Prontos" },
  { value: "OUT_FOR_DELIVERY", label: "Em Entrega" },
  { value: "DELIVERED", label: "Entregues" },
  { value: "CANCELLED", label: "Cancelados" },
];

export function OrdersListClient({
  initialOrders,
  restaurantId,
  currentPage,
  totalPages,
  currentStatus,
}: OrdersListClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const router = useRouter();

  const handleAccept = async (orderId: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/restaurants/${restaurantId}/orders/${orderId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("auth-token="))
                ?.split("=")[1]
            }`,
          },
        }
      );
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      alert("Erro ao aceitar pedido");
    }
  };

  const handleReject = async (orderId: string, reason: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/restaurants/${restaurantId}/orders/${orderId}/reject`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("auth-token="))
                ?.split("=")[1]
            }`,
          },
          body: JSON.stringify({ rejectionReason: reason }),
        }
      );
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Erro ao rejeitar pedido");
    }
  };

  const handleReady = async (orderId: string) => {
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/restaurants/${restaurantId}/orders/${orderId}/ready`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("auth-token="))
                ?.split("=")[1]
            }`,
          },
        }
      );
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updatedOrder : o))
        );
      }
    } catch (error) {
      console.error("Error marking order ready:", error);
      alert("Erro ao marcar pedido como pronto");
    }
  };

  const handleFilterChange = (status: OrderStatus | "ALL") => {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (status !== "ALL") params.set("status", status);
    router.push(`/restaurant/orders?${params.toString()}`);
  };

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              (filter.value === "ALL" && !currentStatus) ||
              filter.value === currentStatus
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-600">
          Nenhum pedido encontrado com esse filtro
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onReady={handleReady}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-700">
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <a
              href={
                hasPrev
                  ? `/restaurant/orders?page=${currentPage - 1}${
                      currentStatus ? `&status=${currentStatus}` : ""
                    }`
                  : "#"
              }
              className={`rounded-md border px-3 py-1 ${
                hasPrev
                  ? "text-gray-700 hover:bg-gray-50"
                  : "cursor-not-allowed text-gray-400 bg-gray-50"
              }`}
              aria-disabled={!hasPrev}
            >
              ← Anterior
            </a>
            <a
              href={
                hasNext
                  ? `/restaurant/orders?page=${currentPage + 1}${
                      currentStatus ? `&status=${currentStatus}` : ""
                    }`
                  : "#"
              }
              className={`rounded-md border px-3 py-1 ${
                hasNext
                  ? "text-gray-700 hover:bg-gray-50"
                  : "cursor-not-allowed text-gray-400 bg-gray-50"
              }`}
              aria-disabled={!hasNext}
            >
              Próxima →
            </a>
          </div>
        </div>
      )}
    </>
  );
}

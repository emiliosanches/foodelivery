"use client";

import { useState } from "react";
import type { Order } from "@/lib/service/restaurant-orders";
import OrderCard from "@/components/restaurant/order-card";

type RestaurantOrdersClientProps = {
  initialOrders: Order[];
  restaurantId: string;
};

export function RestaurantOrdersClient({
  initialOrders,
  restaurantId,
}: RestaurantOrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);

  const handleAccept = async (orderId: string) => {
    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders/${orderId}/accept`,
        {
          method: "PATCH",
          credentials: "include",
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
        `/api/restaurants/${restaurantId}/orders/${orderId}/reject`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejectionReason: reason }),
        }
      );
      if (res.ok) {
        // Remove from active orders
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Erro ao rejeitar pedido");
    }
  };

  const handleReady = async (orderId: string) => {
    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders/${orderId}/ready`,
        {
          method: "PATCH",
          credentials: "include",
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

  return (
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
  );
}

"use client";

import { useState } from "react";
import type { Order } from "@/lib/service/restaurant-orders";
import OrderStatusBadge from "./order-status-badge";
import { formatMoneyFromCents } from "@/lib/utils/format";

type OrderCardProps = {
  order: Order;
  onAccept?: (orderId: string) => Promise<void>;
  onReject?: (orderId: string, reason: string) => Promise<void>;
  onReady?: (orderId: string) => Promise<void>;
  showActions?: boolean;
};

export default function OrderCard({
  order,
  onAccept,
  onReject,
  onReady,
  showActions = true,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const canAccept = order.status === "PENDING";
  const canReject = order.status === "PENDING";
  const canMarkReady = order.status === "PREPARING";

  const handleAccept = async () => {
    if (!onAccept) return;
    setLoading(true);
    try {
      await onAccept(order.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!onReject || !rejectionReason.trim()) return;
    setLoading(true);
    try {
      await onReject(order.id, rejectionReason);
      setIsRejecting(false);
      setRejectionReason("");
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async () => {
    if (!onReady) return;
    setLoading(true);
    try {
      await onReady(order.id);
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900">
              #{order.id.slice(0, 8)}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">
            {formatMoneyFromCents(order.totalAmount)}
          </p>
          <p className="text-xs text-gray-500">
            Taxa: {formatMoneyFromCents(order.deliveryFee)}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      {order.customer && (
        <div className="mb-3 rounded-md bg-gray-50 p-3">
          <p className="font-semibold text-gray-900">{order.customer.name}</p>
          {order.customer.phone && (
            <p className="text-sm text-gray-600">📱 {order.customer.phone}</p>
          )}
        </div>
      )}

      {/* Address */}
      <div className="mb-3 text-sm text-gray-700">
        <p className="font-medium">📍 Endereço de entrega:</p>
        <p>
          {order.deliveryAddress.street}, {order.deliveryAddress.number}
          {order.deliveryAddress.complement &&
            ` - ${order.deliveryAddress.complement}`}
        </p>
        <p>
          {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} -{" "}
          {order.deliveryAddress.state}
        </p>
      </div>

      {/* Items Summary */}
      <div className="mb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? "▼" : "▶"} {order.items.length} item(ns)
        </button>
        {isExpanded && (
          <ul className="mt-2 space-y-1 border-t pt-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">
                  {formatMoneyFromCents(item.totalPrice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Observations */}
      {order.observations && (
        <div className="mb-3 rounded-md bg-yellow-50 p-2 text-sm">
          <p className="font-medium text-yellow-900">💬 Observações:</p>
          <p className="text-yellow-800">{order.observations}</p>
        </div>
      )}

      {/* Rejection Reason */}
      {order.rejectionReason && (
        <div className="mb-3 rounded-md bg-red-50 p-2 text-sm">
          <p className="font-medium text-red-900">❌ Motivo da rejeição:</p>
          <p className="text-red-800">{order.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (canAccept || canReject || canMarkReady) && (
        <div className="border-t pt-3">
          {!isRejecting ? (
            <div className="flex flex-wrap gap-2">
              {canAccept && (
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:bg-gray-300"
                >
                  {loading ? "..." : "✅ Aceitar"}
                </button>
              )}
              {canReject && (
                <button
                  onClick={() => setIsRejecting(true)}
                  disabled={loading}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
                >
                  ❌ Rejeitar
                </button>
              )}
              {canMarkReady && (
                <button
                  onClick={handleReady}
                  disabled={loading}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {loading ? "..." : "🎉 Marcar como Pronto"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Motivo da rejeição:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                rows={3}
                placeholder="Ex: Item em falta, restaurante fechado..."
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-gray-300"
                >
                  {loading ? "..." : "Confirmar Rejeição"}
                </button>
                <button
                  onClick={() => {
                    setIsRejecting(false);
                    setRejectionReason("");
                  }}
                  disabled={loading}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

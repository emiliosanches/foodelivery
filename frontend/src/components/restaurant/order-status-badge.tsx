import type { OrderStatus } from "@/lib/service/restaurant-orders";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: string }
> = {
  PENDING: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "⏳",
  },
  PREPARING: {
    label: "Preparando",
    className: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "👨‍🍳",
  },
  READY: {
    label: "Pronto",
    className: "bg-green-100 text-green-800 border-green-300",
    icon: "✅",
  },
  OUT_FOR_DELIVERY: {
    label: "Em entrega",
    className: "bg-purple-100 text-purple-800 border-purple-300",
    icon: "🚚",
  },
  DELIVERED: {
    label: "Entregue",
    className: "bg-gray-100 text-gray-800 border-gray-300",
    icon: "🎉",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-100 text-red-800 border-red-300",
    icon: "❌",
  },
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
  showIcon?: boolean;
};

export default function OrderStatusBadge({
  status,
  showIcon = true,
}: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}

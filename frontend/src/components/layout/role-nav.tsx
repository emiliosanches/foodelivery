"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function RoleNav() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "RESTAURANT") {
    return (
      <Link
        href="/restaurant/dashboard"
        className="text-gray-600 hover:text-primary-600"
      >
        Dashboard Restaurante
      </Link>
    );
  }

  if (user.role === "DELIVERY") {
    return (
      <Link
        href="/delivery/dashboard"
        className="text-gray-600 hover:text-primary-600"
      >
        Dashboard Entregador
      </Link>
    );
  }

  return (
    <Link href="/orders" className="text-gray-600 hover:text-primary-600">
      Meus Pedidos
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, CreditCard, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const navItems = [
  {
    label: "Personal Info",
    href: "/profile",
    icon: User,
  },
  {
    label: "My Orders",
    href: "/profile/orders",
    icon: ShoppingBag,
  },
  {
    label: "Payment Methods",
    href: "/profile/payment",
    icon: CreditCard,
  },
  {
    label: "Addresses",
    href: "/profile/addresses",
    icon: MapPin,
  },
];

export default function ProfileNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow p-4 h-fit">
      <h2 className="font-medium text-lg mb-4">Menu</h2>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          );
        })}

        <button
          onClick={() => logout()}
          className="flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-red-50 w-full text-left transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Log Out
        </button>
      </nav>
    </div>
  );
}

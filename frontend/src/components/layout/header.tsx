"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, ShoppingBag, LogOut } from "lucide-react";
import Button from "../ui/button";
import { useAuth } from "@/contexts/auth-context";
import Logo from "../ui/logo";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="">
            <Logo />
          </Link>

          <nav className="hidden md:flex gap-6 items-center">
            <Link
              href="/restaurants"
              className="text-gray-600 hover:text-primary-600"
            >
              Restaurantes
            </Link>

            {user ? (
              <>
                <Link
                  href="/orders"
                  className="text-gray-600 hover:text-primary-600"
                >
                  Meus Pedidos
                </Link>
                <div className="relative">
                  <button className="flex items-center text-gray-600 hover:text-primary-600">
                    <User className="w-5 h-5 mr-1" />
                    <span>{user.name.split(" ")[0]}</span>
                  </button>
                </div>
                <Link href="/cart">
                  <Button variant="primary" size="sm">
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    Carrinho
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </nav>

          <button
            className="md:hidden flex items-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link
              href="/restaurants"
              className="block py-2 text-gray-600 hover:text-primary-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Restaurantes
            </Link>

            {user ? (
              <>
                <Link
                  href="/orders"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meus Pedidos
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 text-gray-600 hover:text-primary-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Minha Conta
                </Link>
                <Link
                  href="/cart"
                  className="block py-2 text-primary-600 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Carrinho
                </Link>
                <button
                  className="flex items-center py-2 text-red-600 hover:text-red-800"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sair
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 mt-4">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button variant="outline" className="w-full">
                    Entrar
                  </Button>
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

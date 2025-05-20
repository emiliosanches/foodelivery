// src/components/layout/footer.tsx
import Link from "next/link";
import Logo from "../ui/logo";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/" className="text-xl font-bold text-primary-600">
              <Logo />
            </Link>
            <p className="text-gray-600 text-sm mt-1">
              Sistema de Pedidos e Entregas
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link
              href="/about"
              className="text-gray-600 hover:text-primary-600"
            >
              Sobre
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 hover:text-primary-600"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 hover:text-primary-600"
            >
              Privacidade
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center text-gray-500 text-sm">
          © {year} mini-food. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

// src/app/page.tsx (substituindo o existente)
import Link from "next/link";
import Button from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Delivery de comida rápido e prático
              </h1>
              <p className="text-lg text-gray-700 mb-6">
                Escolha entre os melhores restaurantes da sua região e receba
                seu pedido em minutos. Acompanhe o status da entrega em tempo
                real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/restaurants">
                  <Button size="lg">Ver Restaurantes</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" size="lg">
                    Cadastre-se
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full md:w-1/2 pl-20">
              <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center relative">
                {/* Placeholder para uma imagem/ilustração */}
                <Image
                  fill
                  src="/images/hero-2.png"
                  alt=""
                  className="absolute object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Escolha um restaurante
              </h3>
              <p className="text-gray-600">
                Navegue pelos melhores restaurantes disponíveis na sua região.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Faça seu pedido</h3>
              <p className="text-gray-600">
                Selecione os itens que deseja e adicione ao carrinho.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 text-primary-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Acompanhe a entrega
              </h3>
              <p className="text-gray-600">
                Receba atualizações em tempo real sobre o status do seu pedido.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

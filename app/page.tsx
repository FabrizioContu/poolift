import Link from "next/link";
import { Gift, Users, Calendar, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">Poolift</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#como-funciona"
              className="text-gray-700 hover:text-gray-900 hidden sm:block"
            >
              Como funciona
            </Link>
            <Link href="/groups">
              <Button variant="secondary" className="px-4 py-2">
                Mis Grupos
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Organiza regalos en grupo,
            <br />
            sin complicaciones
          </h1>

          <p className="text-lg md:text-xl text-gray-700 mb-8">
            Coordina contribuciones, vota propuestas y compra juntos.
            <br />
            Para cualquier ocasion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/create-group">
              <Button className="px-8 py-4 text-lg w-full sm:w-auto">
                Crear Grupo
              </Button>
            </Link>

            <Link href="/create-direct-gift">
              <Button
                variant="secondary"
                className="px-8 py-4 text-lg w-full sm:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50"
              >
                Regalo Directo
              </Button>
            </Link>
          </div>

          <Link
            href="#comparacion"
            className="text-sm text-gray-700 hover:text-gray-700 underline"
          >
            No sabes cual elegir?
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span>Gratis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span>Sin registro obligatorio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              <span>Facil de usar</span>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
          Para que puedes usar Poolift?
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Grupos permanentes */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Users className="text-blue-600" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              Grupos permanentes
            </h3>
            <p className="text-gray-700 mb-4">Para regalos recurrentes</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Clase del cole</li>
              <li>Equipo de trabajo</li>
              <li>Familia extensa</li>
            </ul>
          </div>

          {/* Grupos de amigos */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-purple-600" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              Grupos de amigos
            </h3>
            <p className="text-gray-700 mb-4">Coordina cumpleanos</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Grupo de amigos</li>
              <li>Comunidad</li>
              <li>Club deportivo</li>
            </ul>
          </div>

          {/* Ocasiones puntuales */}
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Gift className="text-green-600" size={28} />
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900">
              Ocasiones puntuales
            </h3>
            <p className="text-gray-700 mb-4">Solo esta vez</p>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>Regalo puntual</li>
              <li>Despedida</li>
              <li>Boda / Nacimiento</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            Como funciona
          </h2>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Grupo Permanente */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-blue-700">
                Grupo Permanente
              </h3>
              <p className="text-gray-700 mb-6">
                Para regalos recurrentes durante todo el ano
              </p>

              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <span className="text-gray-700">Crea el grupo</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <span className="text-gray-700">Invita miembros</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <span className="text-gray-700">Anade personas</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <span className="text-gray-700">Propon y vota regalos</span>
                </li>
              </ol>

              <Link href="/create-group" className="block mt-6">
                <Button className="w-full">Crear Grupo</Button>
              </Link>
            </div>

            {/* Regalo Directo */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-semibold mb-4 text-green-700">
                Regalo Directo
              </h3>
              <p className="text-gray-700 mb-6">
                Para ocasiones unicas y rapidas
              </p>

              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </span>
                  <span className="text-gray-700">Crea el regalo</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </span>
                  <span className="text-gray-700">Comparte el link</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </span>
                  <span className="text-gray-700">Recoge confirmaciones</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </span>
                  <span className="text-gray-700">Compra y cierra</span>
                </li>
              </ol>

              <Link href="/create-direct-gift" className="block mt-6">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Regalo Directo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">
            Listo para empezar?
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-group">
              <Button className="px-8 py-4 text-lg w-full sm:w-auto">
                Crear Grupo
              </Button>
            </Link>

            <Link href="/create-direct-gift">
              <Button
                variant="secondary"
                className="px-8 py-4 text-lg w-full sm:w-auto border-2 border-green-600 text-green-600 hover:bg-green-50"
              >
                Regalo Directo
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-gray-700">
            Ya tienes un codigo?{" "}
            <Link href="/join" className="text-blue-600 hover:underline">
              Unirse a grupo
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift size={24} />
            <span className="text-xl font-bold">Poolift</span>
          </div>
          <p className="text-gray-300">Organiza regalos en grupo</p>
        </div>
      </footer>
    </div>
  );
}

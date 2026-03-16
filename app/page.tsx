import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Gift,
  Zap,
  Users,
  Share2,
  CheckCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { MisGruposButton } from "@/components/nav/MisGruposButton";

const UserMenu = dynamic(() =>
  import("@/components/auth/UserMenu").then((m) => ({ default: m.UserMenu })),
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-bondi-blue-50 to-white dark:from-bondi-blue-800 dark:to-bondi-blue-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 ">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="text-bondi-blue-500" size={32} />
            <span className="text-2xl font-bold text-gray-900 dark:text-bondi-blue-50">Poolift</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#como-funciona"
              className="text-gray-700 hover:text-gray-900 hidden sm:block dark:text-bondi-blue-200 dark:hover:text-bondi-blue-50"
            >
              Como funciona
            </Link>
            <MisGruposButton />
            <UserMenu />
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 dark:text-bondi-blue-50">
              Regalos en grupo,
              <br />
              facil y al instante
            </h1>

            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto dark:text-bondi-blue-200">
              Comparte tu idea, coordina con quien quieras y organiza el regalo
              perfecto en minutos.
            </p>

            <Link
              href="/start"
              className="inline-flex items-center px-10 py-4 text-lg rounded-lg font-bold transition bg-bondi-blue-400 text-white hover:bg-bondi-blue-500"
            >
              Organiza tu regalo
              <ArrowRight className="ml-2 inline" size={20} />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-gray-700 dark:text-bondi-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>Gratis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>Sin registro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-emerald-400" />
                <span>Listo en 2 minutos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-bondi-blue-50">
            Por que usar Poolift?
          </h2>
          <p className="text-center text-gray-700 mb-12 max-w-xl mx-auto dark:text-bondi-blue-200">
            Olvida los grupos de WhatsApp interminables y las hojas de calculo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Rapidez */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition dark:bg-bondi-blue-700 dark:border-bondi-blue-600">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 dark:bg-yellow-900">
                <Zap className="text-yellow-600 dark:text-yellow-300" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-bondi-blue-50">
                Rapido
              </h3>
              <p className="text-gray-700 dark:text-bondi-blue-200">
                Crea un regalo y comparte el link en segundos. Sin registros,
                sin esperas.
              </p>
            </div>

            {/* Coordinacion */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition dark:bg-bondi-blue-700 dark:border-bondi-blue-600">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-bondi-blue-100 rounded-full flex items-center justify-center mb-4 dark:bg-bondi-blue-600">
                <Users className="text-bondi-blue-500 dark:text-bondi-blue-200" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-bondi-blue-50">
                Coordinado
              </h3>
              <p className="text-gray-700 dark:text-bondi-blue-200">
                Todos ven quien participa y cuanto falta. Nada de preguntar uno
                por uno.
              </p>
            </div>

            {/* Compartir */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition dark:bg-bondi-blue-700 dark:border-bondi-blue-600">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 dark:bg-emerald-800">
                <Share2 className="text-emerald-500 dark:text-emerald-300" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gray-900 dark:text-bondi-blue-50">
                Facil de compartir
              </h3>
              <p className="text-gray-700 dark:text-bondi-blue-200">
                Un solo link por WhatsApp y listo. Quien quiera participar, se
                apunta.
              </p>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="bg-gray-50 py-16 dark:bg-bondi-blue-800">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-900 dark:text-bondi-blue-50">
              Como funciona
            </h2>
            <p className="text-center text-gray-700 mb-12 max-w-xl mx-auto dark:text-bondi-blue-200">
              Tienes una idea de regalo? Compartela en 3 pasos.
            </p>

            <div className="max-w-3xl mx-auto">
              {/* Steps */}
              <div className="space-y-6">
                <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-sm dark:bg-bondi-blue-700">
                  <span className="shrink-0 w-10 h-10 bg-bondi-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    1
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 dark:text-bondi-blue-50">
                      Describe el regalo
                    </h3>
                    <p className="text-gray-700 dark:text-bondi-blue-200">
                      Para quien es, que ocasion, y si ya tienes una idea en
                      mente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-sm dark:bg-bondi-blue-700">
                  <span className="shrink-0 w-10 h-10 bg-bondi-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 dark:text-bondi-blue-50">
                      Comparte el link
                    </h3>
                    <p className="text-gray-700 dark:text-bondi-blue-200">
                      Envia el enlace por WhatsApp al grupo. Quien quiera
                      participar, se apunta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-white p-6 rounded-xl shadow-sm dark:bg-bondi-blue-700">
                  <span className="shrink-0 w-10 h-10 bg-bondi-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 dark:text-bondi-blue-50">
                      Coordina y compra
                    </h3>
                    <p className="text-gray-700 dark:text-bondi-blue-200">
                      Ve quien participa en tiempo real. Cuando estes listo,
                      compra y cierra el regalo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fork: two options */}
              <div className="mt-12 p-6 bg-white rounded-xl border-2 border-bondi-blue-100 dark:bg-bondi-blue-700 dark:border-bondi-blue-600">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-bondi-blue-500" size={24} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-bondi-blue-50">
                    Desde donde quieres empezar?
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/create-direct-gift" className="block">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition group dark:border-bondi-blue-600 dark:hover:border-emerald-600 dark:hover:bg-emerald-900">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="text-emerald-500" size={20} />
                        <span className="font-medium text-gray-900 dark:text-bondi-blue-50">
                          Tengo una idea
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-bondi-blue-200">
                        Ya se que regalar. Quiero organizar este regalo ahora.
                      </p>
                    </div>
                  </Link>

                  <Link href="/create-group" className="block">
                    <div className="p-4 border border-gray-200 rounded-lg hover:border-bondi-blue-300 hover:bg-bondi-blue-50 transition group dark:border-bondi-blue-600 dark:hover:border-bondi-blue-400 dark:hover:bg-bondi-blue-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-bondi-blue-500" size={20} />
                        <span className="font-medium text-gray-900 dark:text-bondi-blue-50">
                          Crear un grupo
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-bondi-blue-200">
                        Para coordinar multiples regalos con el mismo grupo de
                        personas.
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-bondi-blue-50">
              Listo para organizar tu regalo?
            </h2>
            <p className="text-gray-700 mb-6 dark:text-bondi-blue-200">
              Empieza ahora, es gratis y sin registro.
            </p>

            <Link
              href="/start"
              className="inline-flex items-center px-10 py-4 text-lg rounded-lg font-bold transition bg-bondi-blue-400 text-white hover:bg-bondi-blue-500"
            >
              Empezar
              <ArrowRight className="ml-2 inline" size={20} />
            </Link>

            <p className="mt-6 text-gray-700 dark:text-bondi-blue-200">
              Ya tienes un codigo?{" "}
              <Link href="/join" className="text-bondi-blue-500 hover:underline dark:text-bondi-blue-200 dark:hover:text-bondi-blue-50">
                Unirse a grupo
              </Link>
            </p>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift size={24} />
            <span className="text-xl font-bold">Poolift</span>
          </div>
          <p className="text-gray-400 dark:text-gray-300">Organiza regalos en grupo</p>
          <div className="mx-auto pt-1">
            <p className="text-sm text-white/80 text-center">
              Desarrollado por{" "}
              <a
                href="https://fabriziocontu.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition"
                aria-label="Web desarrollada por FabriDev"
              >
                FabriDev
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

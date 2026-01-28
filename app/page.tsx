import Link from "next/link";
import { Gift, FolderOpen } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <Gift className="w-20 h-20 mx-auto mb-6 text-blue-500" />

          <h1 className="text-5xl font-bold text-gray-900 mb-4">Poolift</h1>

          <p className="text-xl text-gray-600 mb-8">Regalos juntos, mejor</p>

          <p className="text-lg text-gray-700 mb-12">
            Organiza regalos de cumpleaños escolares sin complicaciones.
            Coordina, vota y participa fácilmente.
          </p>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4 justify-center">
              <Link
                href="/create-group"
                className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Crear Grupo
              </Link>

              <Link
                href="/join"
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Unirse a Grupo
              </Link>
            </div>

            <Link
              href="/groups"
              className="flex items-center gap-2 bg-lime-100 rounded-md p-3 text-gray-600 hover:text-blue-600 transition font-medium"
            >
              <FolderOpen size={20} />
              Ver Grupos Activos
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎂</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Fiestas Conjuntas</h3>
            <p className="text-gray-600">
              Celebra a varios niños en una sola fiesta
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗳️</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Votación Democrática</h3>
            <p className="text-gray-600">Todos proponen y votan el regalo</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="font-bold text-lg mb-2">División Justa</h3>
            <p className="text-gray-600">Precio dividido automáticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}

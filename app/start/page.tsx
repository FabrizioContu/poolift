import Link from "next/link";
import { Gift, Users, ArrowLeft, Sparkles, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui";

export default function StartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gift className="text-blue-600" size={32} />
            <span className="text-2xl font-bold text-gray-900">Poolift</span>
          </Link>
          <Link href="/" className="text-gray-700 hover:text-gray-900 flex items-center gap-1">
            <ArrowLeft size={18} />
            Volver
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-blue-600" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Desde donde quieres empezar?
          </h1>
          <p className="text-gray-700 text-lg">
            Elige la opcion que mejor se adapte a tu situacion.
          </p>
        </div>

        {/* Two Options */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Option 1: Tengo una idea */}
          <Link href="/create-direct-gift" className="block group">
            <div className="h-full bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-green-400 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift className="text-green-600" size={32} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Tengo una idea de regalo
              </h2>

              <p className="text-gray-700 mb-6">
                Ya se que regalar o tengo una idea en mente. Quiero organizar este regalo ahora y compartirlo.
              </p>

              <div className="space-y-2 text-sm text-gray-700 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Cumpleanos, bodas, despedidas...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-gray-500" />
                  <span>Regalo unico para una ocasion</span>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                Organizar regalo
              </Button>
            </div>
          </Link>

          {/* Option 2: Crear grupo */}
          <Link href="/create-group" className="block group">
            <div className="h-full bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-blue-600" size={32} />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Crear un grupo
              </h2>

              <p className="text-gray-700 mb-6">
                Quiero coordinar multiples regalos con el mismo grupo de personas a lo largo del tiempo.
              </p>

              <div className="space-y-2 text-sm text-gray-700 mb-6">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span>Clase del cole, equipo de trabajo...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Cumpleanos durante todo el ano</span>
                </div>
              </div>

              <Button className="w-full">
                Crear grupo
              </Button>
            </div>
          </Link>
        </div>

        {/* Already have a code */}
        <div className="text-center mt-12">
          <p className="text-gray-700">
            Ya tienes un codigo de invitacion?{" "}
            <Link href="/join" className="text-blue-600 hover:underline font-medium">
              Unirse a un grupo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

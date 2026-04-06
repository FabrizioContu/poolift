import type { Metadata } from "next";
import Link from "next/link";
import {
  Gift,
  Users,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Calendar,
  Heart,
  Calculator,
} from "lucide-react";

export const metadata: Metadata = { title: "Empezar | Poolift" };

export default function StartPage() {
  return (
    <div className="force-light min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Gift className="text-primary" size={32} />
            <span className="text-2xl font-bold text-foreground">Poolift</span>
          </Link>
          <Link
            href="/"
            className="text-foreground/70 hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft size={18} />
            Volver
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-primary" size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Desde donde quieres empezar?
          </h1>
          <p className="text-foreground/60 text-lg">
            Elige la opcion que mejor se adapte a tu situacion.
          </p>
        </div>

        {/* Two Options */}
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Option 1: Tengo una idea */}
          <Link href="/create-direct-gift" className="block group">
            <div className="h-full bg-background p-8 rounded-2xl border-2 border-border hover:border-emerald-400 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Gift className="text-emerald-500" size={32} />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-3">
                Tengo una idea de regalo
              </h2>

              <p className="text-muted-foreground mb-6">
                Ya se que regalar o tengo una idea en mente. Quiero organizar
                este regalo ahora y compartirlo.
              </p>

              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground/60" />
                  <span>Cumpleanos, bodas, despedidas...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-muted-foreground/60" />
                  <span>Regalo unico para una ocasion</span>
                </div>
              </div>

              <span className="block w-full px-4 py-2 rounded-lg font-bold transition bg-emerald-500 text-white text-center">
                Organizar regalo
              </span>
            </div>
          </Link>

          {/* Option 2: Crear grupo */}
          <Link href="/create-group" className="block group">
            <div className="h-full bg-background p-8 rounded-2xl border-2 border-border hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-primary" size={32} />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-3">
                Crear un grupo
              </h2>

              <p className="text-muted-foreground mb-6">
                Quiero coordinar multiples regalos con el mismo grupo de
                personas a lo largo del tiempo.
              </p>

              <div className="space-y-2 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-muted-foreground/60" />
                  <span>Clase del cole, equipo de trabajo...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-muted-foreground/60" />
                  <span>Cumpleanos durante todo el ano</span>
                </div>
              </div>

              <span className="block w-full px-4 py-2 rounded-lg font-bold transition bg-primary text-primary-foreground text-center">
                Crear grupo
              </span>
            </div>
          </Link>
        </div>

        {/* Calculator tool */}
        <div className="max-w-3xl mx-auto mt-6">
          <Link href="/calculator" className="block group">
            <div className="bg-background px-6 py-4 rounded-2xl border-2 border-border hover:border-orange-400 hover:shadow-lg transition-all flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Calculator className="text-orange-500" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-foreground">
                  Calculadora de gastos
                </h2>
                <p className="text-muted-foreground text-sm">
                  Divide un gasto entre varios o liquida deudas entre el grupo.
                </p>
              </div>
              <ArrowRight
                size={18}
                className="text-muted-foreground/40 group-hover:text-orange-400 transition shrink-0"
              />
            </div>
          </Link>
        </div>

        {/* Already have a code */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Ya tienes un codigo de invitacion?{" "}
            <Link
              href="/join"
              className="text-primary hover:underline font-medium"
            >
              Unirse a un grupo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

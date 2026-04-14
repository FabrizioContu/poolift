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
    <div className="force-light min-h-screen bg-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 ">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="text-primary" size={32} />
            <span className="text-2xl font-bold text-foreground">Poolift</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#como-funciona"
              className="text-muted-foreground hover:text-foreground hidden sm:block"
            >
              Cómo funciona
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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Regalos en grupo,
              <br />
              fácil y al instante
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comparte tu idea, coordina con quien quieras y organiza el regalo
              perfecto en minutos.
            </p>

            <Link
              href="/start"
              className="inline-flex items-center px-10 py-4 text-lg rounded-lg font-bold transition bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Organiza tu regalo
              <ArrowRight className="ml-2 inline" size={20} />
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-muted-foreground">
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
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
            ¿Por qué usar Poolift?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Olvida los grupos de WhatsApp interminables y las hojas de cálculo.
          </p>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {/* Rapidez */}
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="text-yellow-600" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
                Rápido
              </h3>
              <p className="text-muted-foreground">
                Crea un regalo y comparte el link en segundos. Sin registros,
                sin esperas.
              </p>
            </div>

            {/* Coordinacion */}
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/15 rounded-full flex items-center justify-center mb-4">
                <Users className="text-primary" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
                Coordinado
              </h3>
              <p className="text-muted-foreground">
                Todos ven quién participa y cuánto falta. Nada de preguntar uno
                por uno.
              </p>
            </div>

            {/* Compartir */}
            <div className="bg-card p-6 md:p-8 rounded-xl shadow-sm border border-border hover:shadow-md transition">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Share2 className="text-emerald-500" size={28} />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
                Fácil de compartir
              </h3>
              <p className="text-muted-foreground">
                Un solo link por WhatsApp y listo. Quien quiera participar, se
                apunta.
              </p>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
              Cómo funciona
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              ¿Tienes una idea de regalo? Compártela en 3 pasos.
            </p>

            <div className="max-w-3xl mx-auto">
              {/* Steps */}
              <div className="space-y-6">
                <div className="flex gap-4 items-start bg-card p-6 rounded-xl shadow-sm border border-border">
                  <span className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                    1
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Describe el regalo
                    </h3>
                    <p className="text-muted-foreground">
                      Para quién es, qué ocasión, y si ya tienes una idea en
                      mente.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-card p-6 rounded-xl shadow-sm border border-border">
                  <span className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Comparte el link
                    </h3>
                    <p className="text-muted-foreground">
                      Envía el enlace por WhatsApp al grupo. Quien quiera
                      participar, se apunta.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start bg-card p-6 rounded-xl shadow-sm border border-border">
                  <span className="shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Coordina y compra
                    </h3>
                    <p className="text-muted-foreground">
                      Ve quién participa en tiempo real. Cuando estés listo,
                      compra y cierra el regalo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fork: two options */}
              <div className="mt-12 p-6 bg-card rounded-xl border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="text-primary" size={24} />
                  <h3 className="text-lg font-semibold text-foreground">
                    ¿Desde dónde quieres empezar?
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/create-direct-gift" className="block">
                    <div className="p-4 border border-border rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition group">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="text-emerald-500" size={20} />
                        <span className="font-medium text-foreground">
                          Tengo una idea
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ya sé qué regalar. Quiero organizar este regalo ahora.
                      </p>
                    </div>
                  </Link>

                  <Link href="/create-group" className="block">
                    <div className="p-4 border border-border rounded-lg hover:border-primary/40 hover:bg-primary/10 transition group">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-primary" size={20} />
                        <span className="font-medium text-foreground">
                          Crear un grupo
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Para coordinar múltiples regalos con el mismo grupo de
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
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              ¿Listo para organizar tu regalo?
            </h2>
            <p className="text-muted-foreground mb-6">
              Empieza ahora, es gratis y sin registro.
            </p>

            <Link
              href="/start"
              className="inline-flex items-center px-10 py-4 text-lg rounded-lg font-bold transition bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Empezar
              <ArrowRight className="ml-2 inline" size={20} />
            </Link>

            <p className="mt-6 text-muted-foreground">
              ¿Ya tienes un código?{" "}
              <Link
                href="/join"
                className="text-primary hover:underline"
              >
                Unirse a grupo
              </Link>
            </p>
          </div>
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border text-foreground py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift size={24} />
            <span className="text-xl font-bold">Poolift</span>
          </div>
          <p className="text-muted-foreground">Organiza regalos en grupo</p>
          <div className="mx-auto pt-1">
            <p className="text-sm text-muted-foreground text-center">
              Desarrollado por{" "}
              <a
                href="https://fabriziocontu.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition"
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

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowLeft, Key } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import { addGroupToSession, useAuth } from "@/lib/auth";
import { anonymousStorage } from "@/lib/storage";

function JoinPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<"invite" | "familia">(
    searchParams.get("tab") === "familia" ? "familia" : "invite",
  );

  // Invite code tab state
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Family code tab state
  const [familyCode, setFamilyCode] = useState("");
  const [familyError, setFamilyError] = useState<string | null>(null);
  const [familyLoading, setFamilyLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "familia") setTab("familia");
  }, [searchParams]);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    const trimmedCode = inviteCode.trim().toLowerCase();

    if (!trimmedCode) {
      setInviteError("El código de invitación es requerido");
      return;
    }

    if (trimmedCode.length < 6 || trimmedCode.length > 12) {
      setInviteError("El código debe tener entre 6 y 12 caracteres");
      return;
    }

    if (!/^[a-z0-9]+$/.test(trimmedCode)) {
      setInviteError("El código solo puede contener letras y números");
      return;
    }

    router.push(`/join/${trimmedCode}`);
  };

  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyError(null);

    const trimmedCode = familyCode.trim().toLowerCase();

    if (!trimmedCode) {
      setFamilyError("El código de familia es requerido");
      return;
    }

    if (!/^[a-z0-9]+$/.test(trimmedCode)) {
      setFamilyError("El código solo puede contener letras y números");
      return;
    }

    setFamilyLoading(true);

    try {
      const res = await fetch(`/api/families/share/${trimmedCode}`);

      if (!res.ok) {
        const data = await res.json();
        setFamilyError(data.error || "Código de familia no válido");
        return;
      }

      const { family, group } = await res.json();

      // Restore localStorage access
      anonymousStorage.addGroup(group.id);
      addGroupToSession({
        groupId: group.id,
        groupName: group.name,
        familyId: family.id,
        familyName: family.name,
        isCreator: family.is_creator,
        inviteCode: group.invite_code,
      });

      // If authenticated, permanently link user_id
      if (user) {
        await fetch(`/api/families/share/${trimmedCode}`, { method: "POST" });
      }

      router.push(`/dashboard/${group.id}`);
    } catch {
      setFamilyError("Error al verificar el código. Intentalo de nuevo.");
    } finally {
      setFamilyLoading(false);
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-linear-to-b from-primary/10 to-background py-12 px-4"
    >
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>

        <div className="bg-background rounded-lg shadow-lg p-8">
          {/* Tab toggle */}
          <div className="flex border border-border rounded-lg overflow-hidden mb-6">
            <button
              onClick={() => setTab("invite")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                tab === "invite"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Código de invitación
            </button>
            <button
              onClick={() => setTab("familia")}
              className={`flex-1 py-2.5 text-sm font-medium transition ${
                tab === "familia"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Código de familia
            </button>
          </div>

          {tab === "invite" && (
            <>
              <div className="text-center mb-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Unirse a Grupo</h1>
                <p className="text-muted-foreground mt-2">
                  Introduce el código que te han compartido
                </p>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="invite-code"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Código de invitación <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="invite-code"
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toLowerCase())}
                    placeholder="ej: abc123xyz"
                    maxLength={12}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-center text-lg tracking-wider"
                    autoComplete="off"
                  />
                </div>

                {inviteError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {inviteError}
                  </div>
                )}

                <Button type="submit" className="w-full py-3">
                  Continuar
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                ¿No tienes código?{" "}
                <Link href="/create-group" className="text-primary hover:underline">
                  Crear un grupo nuevo
                </Link>
              </p>
            </>
          )}

          {tab === "familia" && (
            <>
              <div className="text-center mb-6">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">Recuperar Acceso</h1>
                <p className="text-muted-foreground mt-2">
                  Ingresá tu código personal de familia para volver a entrar al grupo
                </p>
              </div>

              <form onSubmit={handleFamilySubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="family-code"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Código de familia <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="family-code"
                    type="text"
                    value={familyCode}
                    onChange={(e) => setFamilyCode(e.target.value.toLowerCase())}
                    placeholder="ej: abc123xy"
                    maxLength={12}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent font-mono text-center text-lg tracking-wider"
                    autoComplete="off"
                    autoFocus
                  />
                </div>

                {familyError && (
                  <div
                    role="alert"
                    className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                  >
                    {familyError}
                  </div>
                )}

                <Button type="submit" disabled={familyLoading} className="w-full py-3">
                  {familyLoading ? "Verificando..." : "Recuperar Acceso"}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                ¿No tenés tu código?{" "}
                <button
                  onClick={() => setTab("invite")}
                  className="text-primary hover:underline"
                >
                  Unite con código de invitación
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinPageContent />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import { useAuth } from "@/lib/auth";

const AuthModal = dynamic(() =>
  import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal })),
);

const DISMISS_KEY = "poolift_dismissed_account_banner";

/**
 * SaveAccessBanner — nudge no-intrusivo para usuarios anónimos
 *
 * Invita a crear una cuenta para no perder el acceso al grupo.
 * Se oculta para usuarios autenticados y una vez descartado (localStorage).
 */
export function SaveAccessBanner() {
  const { isAnonymous, loading } = useAuth();
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window === "undefined" ||
      localStorage.getItem(DISMISS_KEY) === "true",
  );
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading || !isAnonymous || dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-primary/10 border border-primary/30 rounded-lg p-4">
        <div className="flex items-start gap-3 flex-1">
          <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Crea una cuenta para no perder tu acceso
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Guarda este grupo en tu perfil y entra desde cualquier dispositivo
              sin necesidad de códigos.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => setShowAuthModal(true)}
            className="text-sm"
          >
            Crear cuenta
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted transition"
            aria-label="Descartar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="register"
      />
    </>
  );
}

export default SaveAccessBanner;

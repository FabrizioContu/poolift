"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, ChevronDown, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";

const AuthModal = dynamic(() =>
  import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal })),
);

/**
 * UserMenu — estado de sesión en el header
 *
 * Anónimo: botón "Entrar" que abre AuthModal
 * Autenticado: avatar con inicial + dropdown (nombre + cerrar sesión)
 */
export function UserMenu() {
  const { user, loading, isAnonymous, signOut } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    setShowDropdown(false);
    await signOut();
    router.push("/");
    setSigningOut(false);
  };

  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (isAnonymous) {
    return (
      <>
        <Button
          onClick={() => setShowAuthModal(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Entrar
        </Button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  const name =
    (user?.user_metadata?.name as string) || user?.email || "Usuario";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
        aria-expanded={showDropdown}
        aria-haspopup="true"
        aria-label={name}
      >
        <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
        {/* <span className="text-sm font-medium hidden sm:inline">{name}</span> */}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{name}</span>
            </div>
            {user?.email && name !== user.email && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">
                {user.email}
              </p>
            )}
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {signingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
}

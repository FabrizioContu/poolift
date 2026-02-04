"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addGroupToSession } from "@/lib/auth";
import { anonymousStorage } from "@/lib/storage";
import dynamic from "next/dynamic";
import type { GroupType } from "@/lib/types";
import {
  GROUP_TYPE_LABELS,
  GROUP_TYPE_ICONS,
  GROUP_TYPE_DESCRIPTIONS,
  GROUP_TYPE_EXAMPLES,
} from "@/lib/types";

const InviteCodeModal = dynamic(
  () => import("@/components/modals/InviteCodeModal")
);

interface GroupResponse {
  group: {
    id: string;
    name: string;
    invite_code: string;
  };
  family: {
    id: string;
    name: string;
  };
}

export default function CreateGroupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [groupType, setGroupType] = useState<GroupType>("class");
  const [groupName, setGroupName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<GroupResponse | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Adaptive copy based on group type
  const getCopy = () => {
    switch (groupType) {
      case "class":
        return {
          groupLabel: "Como se llama la clase?",
          groupPlaceholder: "ej: 2B Primaria / Girasoles guarderia",
          userLabel: "Tu nombre (representante)",
          userPlaceholder: "ej: Familia Garcia",
        };
      case "friends":
        return {
          groupLabel: "Como se llama el grupo?",
          groupPlaceholder: "ej: Los inseparables / Grupo running",
          userLabel: "Tu nombre",
          userPlaceholder: "ej: Carlos",
        };
      case "family":
        return {
          groupLabel: "Como se llama el grupo familiar?",
          groupPlaceholder: "ej: Familia Martinez / Primos Madrid",
          userLabel: "Tu nombre",
          userPlaceholder: "ej: Maria",
        };
      case "work":
        return {
          groupLabel: "Como se llama el equipo?",
          groupPlaceholder: "ej: Equipo Marketing / Oficina Barcelona",
          userLabel: "Tu nombre",
          userPlaceholder: "ej: Laura",
        };
      default:
        return {
          groupLabel: "Como se llama el grupo?",
          groupPlaceholder: "ej: Club de lectura / Vecinos bloque 5",
          userLabel: "Tu nombre",
          userPlaceholder: "ej: Ana",
        };
    }
  };

  const copy = getCopy();

  const validateForm = (): string | null => {
    const trimmedGroupName = groupName.trim();
    const trimmedFamilyName = familyName.trim();

    if (!trimmedGroupName) {
      return "El nombre del grupo es requerido";
    }
    if (trimmedGroupName.length < 3) {
      return "El nombre del grupo debe tener al menos 3 caracteres";
    }
    if (trimmedGroupName.length > 50) {
      return "El nombre del grupo no puede tener mas de 50 caracteres";
    }
    if (!trimmedFamilyName) {
      return "Tu nombre es requerido";
    }
    if (trimmedFamilyName.length < 2) {
      return "Tu nombre debe tener al menos 2 caracteres";
    }
    if (trimmedFamilyName.length > 50) {
      return "Tu nombre no puede tener mas de 50 caracteres";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: groupName.trim(),
          familyName: familyName.trim(),
          type: groupType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear grupo");
      }

      const data: GroupResponse = await response.json();

      // Save session to localStorage
      addGroupToSession({
        groupId: data.group.id,
        groupName: data.group.name,
        familyId: data.family.id,
        familyName: data.family.name,
        isCreator: true,
        inviteCode: data.group.invite_code,
      });

      // Track grupo para usuario anonimo
      anonymousStorage.addGroup(data.group.id);

      setCreatedGroup(data);
      setShowInviteModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    if (createdGroup) {
      router.push(`/dashboard/${createdGroup.group.id}`);
    }
  };

  const groupTypes: GroupType[] = ["class", "friends", "family", "work", "other"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Grupo</h1>
            <p className="text-gray-700 mt-2">
              {step === 1
                ? "Que tipo de grupo es?"
                : `Configura tu grupo de ${GROUP_TYPE_LABELS[groupType].toLowerCase()}`}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-6">
            <div
              className={`w-3 h-3 rounded-full ${
                step === 1 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
            <div
              className={`w-3 h-3 rounded-full ${
                step === 2 ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Step 1: Group Type Selection */}
          {step === 1 && (
            <div className="space-y-3">
              {groupTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setGroupType(type);
                    setStep(2);
                  }}
                  className="w-full p-4 border rounded-lg text-left hover:bg-gray-50 hover:border-blue-300 transition flex items-start gap-3"
                >
                  <span className="text-2xl">{GROUP_TYPE_ICONS[type]}</span>
                  <div>
                    <div className="font-medium">{GROUP_TYPE_LABELS[type]}</div>
                    <div className="text-sm text-gray-700">
                      {GROUP_TYPE_DESCRIPTIONS[type]}
                    </div>
                  </div>
                </button>
              ))}

              <p className="text-center text-sm text-gray-700 mt-6">
                Solo necesitas un regalo puntual?{" "}
                <Link
                  href="/create-direct-gift"
                  className="text-green-600 hover:underline"
                >
                  Regalo directo
                </Link>
              </p>
            </div>
          )}

          {/* Step 2: Group Details */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Examples box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Ejemplos de nombres:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {GROUP_TYPE_EXAMPLES[groupType].map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </div>

              {/* Group name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.groupLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={copy.groupPlaceholder}
                  maxLength={50}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                  autoFocus
                />
                <p className="text-xs text-gray-700 mt-1">
                  {groupName.length}/50 caracteres
                </p>
              </div>

              {/* User/Family name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {copy.userLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder={copy.userPlaceholder}
                  maxLength={50}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-700 mt-1">
                  {familyName.length}/50 caracteres
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Atras
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creando..." : "Crear Grupo"}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <p className="text-center text-sm text-gray-700 mt-6">
              Ya tienes un codigo de invitacion?{" "}
              <Link href="/join" className="text-blue-500 hover:underline">
                Unirse a grupo
              </Link>
            </p>
          )}
        </div>
      </div>

      {showInviteModal && createdGroup && (
        <InviteCodeModal
          isOpen={showInviteModal}
          onClose={handleGoToDashboard}
          inviteCode={createdGroup.group.invite_code}
          groupId={createdGroup.group.id}
          groupName={createdGroup.group.name}
        />
      )}
    </div>
  );
}

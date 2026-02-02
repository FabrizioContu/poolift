"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addGroupToSession } from "@/lib/auth";
import { anonymousStorage } from "@/lib/storage";
import dynamic from "next/dynamic";

const InviteCodeModal = dynamic(
  () => import("@/components/modals/InviteCodeModal"),
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
  const [groupName, setGroupName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdGroup, setCreatedGroup] = useState<GroupResponse | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

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
      return "El nombre del grupo no puede tener más de 50 caracteres";
    }
    if (!trimmedFamilyName) {
      return "El nombre de tu familia es requerido";
    }
    if (trimmedFamilyName.length < 2) {
      return "El nombre de familia debe tener al menos 2 caracteres";
    }
    if (trimmedFamilyName.length > 50) {
      return "El nombre de familia no puede tener más de 50 caracteres";
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

      // Track grupo para usuario anónimo
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

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Crear Grupo</h1>
            <p className="text-gray-600 mt-2">
              Crea un grupo para organizar regalos de cumpleaños
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del grupo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="ej: Cumpleaños Clase 2B"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                {groupName.length}/50 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de tu familia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="ej: Familia García"
                maxLength={50}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                {familyName.length}/50 caracteres
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3"
            >
              {isSubmitting ? "Creando..." : "Crear Grupo"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes un código de invitación?{" "}
            <Link href="/join" className="text-blue-500 hover:underline">
              Unirse a grupo
            </Link>
          </p>
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

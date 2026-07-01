"use client";

import { useState } from "react";
import { Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui-custom/Button";
import dynamic from "next/dynamic";
import { getGroupSession } from "@/lib/auth";

const CreateGiftModal = dynamic(
  () => import("@/components/modals/CreateGiftModal"),
);

interface SelectProposalButtonProps {
  proposalId: string;
  proposalName: string;
  totalPrice: number;
  partyId: string;
  groupId: string;
  isSelected: boolean;
  isCoordinator: boolean;
  onSuccess?: () => void;
}

export function SelectProposalButton({
  proposalId,
  proposalName,
  totalPrice,
  partyId,
  groupId,
  isSelected,
  isCoordinator,
  onSuccess,
}: SelectProposalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showCreateGift, setShowCreateGift] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCoordinator) return null;

  const handleSelect = async () => {
    setLoading(true);
    setError(null);

    try {
      const familyId = getGroupSession(groupId)?.familyId ?? null;
      const response = await fetch(`/api/proposals/${proposalId}/select`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al seleccionar");
      }

      setShowCreateGift(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al seleccionar");
    } finally {
      setLoading(false);
    }
  };

  if (isSelected) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-sm px-3 py-1.5 rounded-full font-medium">
            <Check size={16} />
            Regalo activo
          </span>
        </div>

        {showCreateGift && (
          <CreateGiftModal
            isOpen={showCreateGift}
            onClose={() => setShowCreateGift(false)}
            proposalId={proposalId}
            proposalName={proposalName}
            totalPrice={totalPrice}
            partyId={partyId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <Button
        onClick={handleSelect}
        disabled={loading}
        className="w-full flex justify-center gap-3"
      >
        <CheckCircle size={18} className="mr-2" />
        {loading ? "Activando..." : "Activar regalo"}
      </Button>

      {showCreateGift && (
        <CreateGiftModal
          isOpen={showCreateGift}
          onClose={() => setShowCreateGift(false)}
          proposalId={proposalId}
          proposalName={proposalName}
          totalPrice={totalPrice}
          partyId={partyId}
        />
      )}
    </div>
  );
}

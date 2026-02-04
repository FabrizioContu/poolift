"use client";

import { useState } from "react";
import { Check, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";

const CreateGiftModal = dynamic(
  () => import("@/components/modals/CreateGiftModal"),
);

interface SelectProposalButtonProps {
  proposalId: string;
  proposalName: string;
  totalPrice: number;
  partyId: string;
  isSelected: boolean;
  isCoordinator: boolean;
  hasOtherSelected: boolean;
  onSuccess?: () => void;
}

export function SelectProposalButton({
  proposalId,
  proposalName,
  totalPrice,
  partyId,
  isSelected,
  isCoordinator,
  hasOtherSelected,
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
      const response = await fetch(`/api/proposals/${proposalId}/select`, {
        method: "PUT",
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
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm px-3 py-1.5 rounded-full font-medium">
            <Check size={16} />
            Propuesta Seleccionada
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

  if (hasOtherSelected) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-700 italic">
          Otra propuesta ya ha sido seleccionada
        </p>
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
        {loading ? "Seleccionando..." : "Seleccionar Propuesta"}
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

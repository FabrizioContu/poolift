"use client";

import { useState } from "react";
import { Button } from "@/components/ui-custom/Button";
import { Modal } from "@/components/ui-custom/Modal";
import { Alert } from "@/components/ui-custom/Alert";
import { CloseParticipationButton } from "@/components/gifts/CloseParticipationButton";
import { ShoppingCart, Settings, Users } from "lucide-react";
import Link from "next/link";
import { useIsCoordinator } from "@/lib/hooks/useIsCoordinator";

interface CoordinatorActionsProps {
  giftId: string;
  shareCode: string;
  giftName: string;
  celebrantNames: string[];
  coordinatorId: string | null;
  groupId: string | null;
  participationOpen: boolean;
  isPurchased: boolean;
  participantCount: number;
  participantNames: string[];
  totalPrice: number;
}

export function CoordinatorActions({
  giftId,
  shareCode,
  giftName,
  celebrantNames,
  coordinatorId,
  groupId,
  participationOpen,
  isPurchased,
  participantCount,
  participantNames,
  totalPrice,
}: CoordinatorActionsProps) {
  const isCoordinator = useIsCoordinator(coordinatorId, groupId ?? "");
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeError, setMergeError] = useState<string | null>(null);
  const [mergeKeep, setMergeKeep] = useState("");
  const [mergeRemove, setMergeRemove] = useState("");

  const handleMerge = async () => {
    if (!mergeKeep || !mergeRemove || mergeKeep === mergeRemove) return;

    setMergeLoading(true);
    setMergeError(null);

    try {
      const response = await fetch(`/api/gifts/${giftId}/participants/merge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keep: mergeKeep, remove: mergeRemove }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMergeError(data.error || "Error al fusionar");
        return;
      }

      setShowMergeModal(false);
      window.location.reload();
    } catch {
      setMergeError("Error al fusionar participantes");
    } finally {
      setMergeLoading(false);
    }
  };

  if (!isCoordinator) {
    return null;
  }

  if (isPurchased) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 mb-2">
          <Settings size={20} />
          <span className="font-semibold">Panel de Coordinador</span>
        </div>
        <p className="text-emerald-600 dark:text-emerald-400 text-sm">
          El regalo ha sido comprado y finalizado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-primary/10 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Settings size={20} />
          <span className="font-semibold">Panel de Coordinador</span>
        </div>

        <div className="space-y-3">
          {participationOpen ? (
            <CloseParticipationButton
              giftId={giftId}
              shareCode={shareCode}
              giftName={giftName}
              celebrantNames={celebrantNames}
              participantCount={participantCount}
              participantNames={participantNames}
              totalPrice={totalPrice}
            />
          ) : (
            <Link href={`/coordinator/${giftId}/purchase`}>
              <Button className="w-full flex items-center justify-center ">
                <ShoppingCart size={18} className="mr-2" />
                <span className="mx-auto">Finalizar Compra</span>
              </Button>
            </Link>
          )}

          {!participationOpen && (
            <p className="text-sm text-muted-foreground text-center">
              Participación cerrada. Procede a finalizar la compra.
            </p>
          )}

          {/* Merge Button - only when open and 2+ participants */}
          {participationOpen && participantCount >= 2 && (
            <Button
              onClick={() => {
                setMergeKeep(participantNames[0] || "");
                setMergeRemove(participantNames[1] || "");
                setMergeError(null);
                setShowMergeModal(true);
              }}
              variant="secondary"
              className="w-full"
            >
              <Users size={18} className="mr-2" />
              Fusionar participantes duplicados
            </Button>
          )}
        </div>
      </div>

      {/* Merge Participants Modal */}
      {showMergeModal && (
        <Modal
          isOpen={showMergeModal}
          onClose={() => setShowMergeModal(false)}
          title="Fusionar participantes duplicados"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecciona la familia a mantener y el duplicado a eliminar. Esta
              acción no se puede deshacer.
            </p>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Mantener
              </label>
              <select
                value={mergeKeep}
                onChange={(e) => setMergeKeep(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {participantNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Eliminar (duplicado)
              </label>
              <select
                value={mergeRemove}
                onChange={(e) => setMergeRemove(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {participantNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {mergeKeep === mergeRemove && (
              <p className="text-sm text-muted-foreground">
                Selecciona dos participantes distintos
              </p>
            )}

            {mergeError && <Alert variant="error">{mergeError}</Alert>}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowMergeModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={mergeLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleMerge}
                disabled={
                  mergeLoading ||
                  !mergeKeep ||
                  !mergeRemove ||
                  mergeKeep === mergeRemove
                }
                className="flex-1"
              >
                {mergeLoading ? "Fusionando..." : "Fusionar"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

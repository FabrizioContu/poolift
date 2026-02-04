"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Settings,
  Lock,
  ShoppingCart,
  AlertTriangle,
  Users,
  Check,
  Copy,
  Share2,
  Trash2,
  XCircle,
} from "lucide-react";
import { formatPrice, calculatePricePerFamily } from "@/lib/utils";
import { removeDirectGiftSession } from "@/lib/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DirectGiftOrganizerActionsProps {
  giftId: string;
  shareCode: string;
  recipientName: string;
  organizerName: string;
  giftIdea: string | null;
  status: string;
  participantCount: number;
  participantNames: string[];
  estimatedPrice: number | null;
}

export function DirectGiftOrganizerActions({
  giftId,
  shareCode,
  recipientName,
  organizerName,
  giftIdea,
  status,
  participantCount,
  participantNames,
  estimatedPrice,
}: DirectGiftOrganizerActionsProps) {
  const router = useRouter();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [finalPricePerPerson, setFinalPricePerPerson] = useState<string | null>(
    null,
  );

  const totalPrice = estimatedPrice || 0;
  const estimatedPricePerPerson = calculatePricePerFamily(
    totalPrice,
    participantCount,
  );
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://poolift.vercel.app";
  const giftUrl = `${appUrl}/gifts/${shareCode}`;

  // Check if current user is organizer (stored in localStorage when creating)
  useEffect(() => {
    const savedOrganizer = localStorage.getItem(
      `direct_gift_${giftId}_organizer`,
    );
    const urlParams = new URLSearchParams(window.location.search);

    setIsOrganizer(
      savedOrganizer === "true" || urlParams.get("organizer") === "true",
    );

    // Auto-mark as organizer if they created this gift
    const directGifts = localStorage.getItem("poolift_direct_gifts");
    if (directGifts) {
      const gifts = JSON.parse(directGifts);
      const isCreator = gifts.some(
        (g: { shareCode: string }) => g.shareCode === shareCode,
      );
      if (isCreator) {
        setIsOrganizer(true);
        localStorage.setItem(`direct_gift_${giftId}_organizer`, "true");
      }
    }
  }, [giftId, shareCode]);

  const handleClose = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/close`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cerrar participación");
      }

      const pricePerPerson = data.pricePerParticipant
        ? data.pricePerParticipant.toFixed(2)
        : estimatedPricePerPerson;

      setFinalPricePerPerson(pricePerPerson);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(giftUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = giftUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Hola! El regalo para ${recipientName} ya tiene ${participantCount} participantes.

${giftIdea ? `Regalo: ${giftIdea}` : ""}
Precio por persona: ${finalPricePerPerson || estimatedPricePerPerson}€

La participación está cerrada. Mas info: ${giftUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    setCancelError(null);

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/cancel`, {
        method: "PUT",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cancelar el regalo");
      }

      // Remove from localStorage
      removeDirectGiftSession(shareCode);

      // Redirect to groups page
      router.push("/groups");
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : "Error al cancelar");
      setCancelLoading(false);
    }
  };

  if (!isOrganizer) {
    return null;
  }

  const isOpen = status === "open";
  const isPurchased = status === "purchased";

  if (isPurchased) {
    return (
      <div className="bg-green-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-green-800 mb-2">
          <Settings size={20} />
          <span className="font-semibold">Panel de Organizador</span>
        </div>
        <p className="text-green-700 text-sm">
          El regalo ha sido comprado y finalizado.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-green-50 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 text-green-800 mb-4">
          <Settings size={20} />
          <span className="font-semibold">Panel de Organizador</span>
        </div>

        <div className="space-y-3">
          {isOpen ? (
            <Button
              onClick={() => setShowConfirmModal(true)}
              variant="secondary"
              className="w-full"
              disabled={participantCount === 0}
            >
              <Lock size={18} className="mr-2" />
              Cerrar Participación
            </Button>
          ) : (
            <Link href={`/organizer/${giftId}/purchase?shareCode=${shareCode}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingCart size={18} className="mr-2" />
                Finalizar Compra
              </Button>
            </Link>
          )}

          {participantCount === 0 && isOpen && (
            <p className="text-sm text-gray-700 text-center">
              Espera a que haya participantes para cerrar
            </p>
          )}

          {!isOpen && (
            <p className="text-sm text-gray-700 text-center">
              Participación cerrada. Procede a finalizar la compra.
            </p>
          )}

          {/* Cancel Button - only show if not purchased */}
          <div className="pt-3 border-t border-green-200">
            <Button
              onClick={() => setShowCancelModal(true)}
              variant="secondary"
              className="w-full text-red-600 hover:bg-red-50 border-red-200"
            >
              <Trash2 size={18} className="mr-2" />
              Cancelar Regalo
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Cerrar Participación"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle
                className="text-yellow-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="font-medium text-yellow-800">¿Estás seguro?</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Una vez cerrada, nadie más podrá apuntarse al regalo.
                </p>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <Users size={18} />
                <span className="font-medium">
                  {participantCount} participantes
                </span>
              </div>
              {estimatedPrice && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total estimado:</span>
                    <span className="font-bold text-green-600">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-green-200">
                    <span className="text-gray-700">Precio por persona:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {estimatedPricePerPerson}€
                    </span>
                  </div>
                </>
              )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowConfirmModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Cerrando..." : "Cerrar Participación"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          title="Participación Cerrada"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <Check className="text-green-600 flex-shrink-0" size={24} />
              <div>
                <p className="font-medium text-green-800">
                  La participación ha sido cerrada
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Comparte el enlace para que vean el precio final.
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div>
                <p className="text-xs text-gray-700 mb-1">Regalo para:</p>
                <p className="font-medium text-gray-700">{recipientName}</p>
              </div>

              {giftIdea && (
                <div>
                  <p className="text-xs text-gray-700 mb-1">Regalo:</p>
                  <p className="font-medium text-gray-700">{giftIdea}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-700">Participantes:</span>
                <span className="font-bold">{participantCount}</span>
              </div>

              {estimatedPrice && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total:</span>
                    <span className="font-bold text-gray-700">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-700">Precio por persona:</span>
                    <span className="font-bold text-green-600 text-xl">
                      {finalPricePerPerson || estimatedPricePerPerson}€
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Participants List */}
            {participantNames.length > 0 && (
              <div>
                <p className="text-xs text-gray-700 mb-2">Participantes:</p>
                <div className="flex flex-wrap gap-1">
                  {participantNames.map((name, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-gray-700">Compartir:</p>

              <Button
                onClick={handleShareWhatsApp}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Share2 size={18} className="mr-2" />
                Compartir por WhatsApp
              </Button>

              <Button
                onClick={handleCopyLink}
                variant="secondary"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check size={18} className="mr-2" />
                    Link Copiado
                  </>
                ) : (
                  <>
                    <Copy size={18} className="mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleCloseSuccess}
                variant="secondary"
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Gift Modal */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancelar Regalo"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <XCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
              <div>
                <p className="font-medium text-red-800">¿Estás seguro?</p>
                <p className="text-sm text-red-700 mt-1">
                  Esta acción no se puede deshacer. El regalo será cancelado y
                  los participantes ya no podrán verlo.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Regalo para:</span> {recipientName}
              </p>
              {participantCount > 0 && (
                <p className="text-sm text-orange-600">
                  Hay {participantCount} participante{participantCount > 1 ? "s" : ""} apuntado{participantCount > 1 ? "s" : ""}.
                </p>
              )}
            </div>

            {cancelError && (
              <p className="text-red-500 text-sm">{cancelError}</p>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="secondary"
                className="flex-1"
                disabled={cancelLoading}
              >
                Volver
              </Button>
              <Button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {cancelLoading ? "Cancelando..." : "Sí, Cancelar Regalo"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

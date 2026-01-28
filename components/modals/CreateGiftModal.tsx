"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Gift, CheckCircle, Copy, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface CreateGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalName: string;
  totalPrice: number;
  partyId: string;
  celebrantNames?: string[];
}

export function CreateGiftModal({
  isOpen,
  onClose,
  proposalId,
  proposalName,
  totalPrice,
  partyId,
  celebrantNames = [],
}: CreateGiftModalProps) {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId,
          proposalId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear regalo");
      }

      setShareCode(data.gift.share_code);
      setCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear regalo");
    } finally {
      setLoading(false);
    }
  };

  const getGiftLink = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/gifts/${shareCode}`;
    }
    return `/gifts/${shareCode}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getGiftLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getGiftLink();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const names =
      celebrantNames.length > 0 ? celebrantNames.join(" y ") : "el cumpleaños";

    const message = `¡Hola! Te invito a participar en el regalo conjunto para ${names}.

Propuesta: ${proposalName}
Precio total: ${formatPrice(totalPrice)}

Apúntate aquí: ${getGiftLink()}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleClose = () => {
    if (created) {
      window.location.reload();
    }
    onClose();
  };

  // Success screen
  if (created && shareCode) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Regalo Creado">
        <div className="text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-xl font-bold mb-2">¡Regalo Creado!</h3>
          <p className="text-gray-600 mb-6">
            Comparte este enlace para que las familias se apunten
          </p>

          {/* Share Code */}
          <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-4">
            <p className="text-sm text-gray-600 mb-2">Código del regalo:</p>
            <code className="text-3xl font-mono font-bold text-blue-600">
              {shareCode}
            </code>
          </div>

          {/* Full Link */}
          <div className="p-3 bg-gray-50 rounded-lg mb-6">
            <p className="text-xs text-gray-500 mb-1">Link directo:</p>
            <code className="text-sm text-gray-700 break-all">
              {getGiftLink()}
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleCopyLink}
              className="w-full flex justify-center gap-3"
            >
              <Copy size={18} className="mr-2" />
              {copied ? "¡Copiado!" : "Copiar Link"}
            </Button>

            <Button
              onClick={handleShareWhatsApp}
              variant="secondary"
              className="w-full flex justify-center gap-5 hover:bg-green-600 hover:text-white"
            >
              <MessageCircle size={18} className="mr-2  " />
              Compartir por WhatsApp
            </Button>

            <Button
              onClick={handleClose}
              variant="secondary"
              className="w-full hover:bg-red-600 hover:text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Confirmation screen
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Regalo">
      <div className="text-center">
        <Gift className="mx-auto text-blue-500 mb-4" size={48} />
        <h3 className="text-xl font-bold mb-2">Crear Regalo</h3>
        <p className="text-gray-600 mb-4">Se creará un regalo basado en:</p>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="font-semibold">{proposalName}</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {formatPrice(totalPrice)}
          </p>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Podrás compartir el link para que las familias se apunten
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="secondary"
            className="flex-1"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={loading} className="flex-1">
            {loading ? "Creando..." : "Crear Regalo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default CreateGiftModal;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Gift, Copy, MessageCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { OccasionType } from "@/lib/types";
import { OCCASION_LABELS } from "@/lib/types";
import { addDirectGiftSession } from "@/lib/auth";

interface CreateDirectGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateDirectGiftModal({
  isOpen,
  onClose,
}: CreateDirectGiftModalProps) {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState<OccasionType>("birthday");
  const [giftIdea, setGiftIdea] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Success state
  const [created, setCreated] = useState(false);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/gifts/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          occasion,
          giftIdea: giftIdea.trim() || null,
          estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
          organizerName: organizerName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear regalo");
      }

      const data = await response.json();
      setShareCode(data.share_code);
      setCreated(true);

      // Save to localStorage for "Mis Regalos" section
      addDirectGiftSession({
        shareCode: data.share_code,
        recipientName: recipientName.trim(),
        occasion,
        giftIdea: giftIdea.trim() || undefined,
        organizerName: organizerName.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el regalo");
    } finally {
      setLoading(false);
    }
  };

  const getGiftLink = () => {
    if (typeof window !== "undefined" && shareCode) {
      return `${window.location.origin}/gifts/${shareCode}`;
    }
    return shareCode ? `/gifts/${shareCode}` : "";
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getGiftLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    const message = `Hola! Estoy organizando un regalo para ${recipientName}.
${giftIdea ? `\nRegalo propuesto: ${giftIdea}` : ""}
${estimatedPrice ? `\nPrecio estimado: ${estimatedPrice}€` : ""}

Apuntate aqui: ${getGiftLink()}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleViewGift = () => {
    if (shareCode) {
      router.push(`/gifts/${shareCode}`);
    }
  };

  // Success screen
  if (created && shareCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-5 max-h-[85vh] overflow-y-auto">
          <div className="text-center">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
            <h2 className="text-xl font-bold mb-1">Regalo Creado!</h2>
            <p className="text-gray-600 text-sm mb-4">
              Comparte el enlace para que otros participen
            </p>

            {/* Link to copy */}
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <code className="text-sm text-gray-700 break-all">
                {getGiftLink()}
              </code>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleViewGift}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Ir al regalo
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="secondary"
                  className="flex-1 flex justify-center items-center gap-2"
                >
                  <Copy size={16} />
                  {copied ? "Copiado!" : "Copiar"}
                </Button>

                <Button
                  onClick={handleShareWhatsApp}
                  variant="secondary"
                  className="flex-1 flex justify-center items-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </Button>
              </div>

              <button
                onClick={handleViewGift}
                className="text-sm text-gray-500 hover:text-gray-700 mt-1"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form screen
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Gift className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-bold">Regalo Directo</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Organiza un regalo puntual sin necesidad de crear un grupo
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Para quien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para quien es el regalo? *
            </label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="ej: Laura (despedida) / Ana y Pedro (boda)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Tipo de ocasion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ocasion *
            </label>
            <select
              required
              value={occasion}
              onChange={(e) => setOccasion(e.target.value as OccasionType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {(Object.keys(OCCASION_LABELS) as OccasionType[]).map((type) => (
                <option key={type} value={type}>
                  {OCCASION_LABELS[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Que regalo propones (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Que regalo propones? (opcional)
            </label>
            <input
              type="text"
              value={giftIdea}
              onChange={(e) => setGiftIdea(e.target.value)}
              placeholder="ej: Experiencia spa, vale Amazon..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Precio estimado (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio estimado (opcional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tu nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre *
            </label>
            <input
              type="text"
              required
              value={organizerName}
              onChange={(e) => setOrganizerName(e.target.value)}
              placeholder="ej: Maria"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Para que te identifiquen como organizador
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "Creando..." : "Crear Regalo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDirectGiftModal;

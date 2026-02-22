"use client";

import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import {
  ShoppingCart,
  Upload,
  FileText,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice, calculatePricePerFamily } from "@/lib/utils";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

const AuthModal = dynamic(() =>
  import("@/components/auth/AuthModal").then((m) => ({ default: m.AuthModal }))
);

interface DirectGiftData {
  id: string;
  share_code: string;
  recipient_name: string;
  gift_idea: string | null;
  estimated_price: number | null;
  organizer_name: string;
  status: string;
  participants: Array<{ id: string; participant_name: string }>;
}

export default function DirectGiftPurchasePage({
  params,
}: {
  params: Promise<{ giftId: string }>;
}) {
  const { giftId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const shareCode = searchParams.get("shareCode");
  const { isAnonymous } = useAuth();

  const [gift, setGift] = useState<DirectGiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuthNudge, setShowAuthNudge] = useState(false);

  const [finalPrice, setFinalPrice] = useState("");
  const [comment, setComment] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Fetch gift data
  useEffect(() => {
    async function fetchGift() {
      if (!shareCode) {
        setError("Código de regalo no encontrado");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/gifts/direct?shareCode=${shareCode}`,
        );
        if (response.ok) {
          const data = await response.json();

          // Fetch participants
          const giftWithParticipants: DirectGiftData = {
            ...data,
            participants: [],
          };

          setGift(giftWithParticipants);

          // Pre-fill with estimated price
          if (data.estimated_price) {
            setFinalPrice(data.estimated_price.toString());
          }

          // Fetch participants count
          // We'll get this from the page itself since we need it for calculation
        } else {
          setError("Regalo no encontrado");
        }
      } catch {
        setError("Error al cargar el regalo");
      } finally {
        setLoading(false);
      }
    }

    fetchGift();
  }, [shareCode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es demasiado grande (máximo 5MB)");
      return;
    }

    setReceipt(file);
    setError(null);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      setError("Ingresa el precio final");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/finalize`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalPrice: parseFloat(finalPrice),
          organizerComment: comment || null,
          receiptImageUrl: null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al finalizar");
      }

      setSuccess(true);
      if (isAnonymous) setShowAuthNudge(true);

      setTimeout(() => {
        if (shareCode) {
          router.push(`/gifts/${shareCode}`);
        } else {
          router.push("/groups");
        }
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al finalizar compra",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-700 mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !gift) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingCart className="mx-auto text-gray-700 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link href="/groups">
            <Button variant="secondary" className="mt-4">
              <ArrowLeft size={18} className="mr-2" />
              Volver a mis grupos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!gift) return null;

  // Check if already purchased
  if (gift.status === "purchased") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Regalo ya finalizado
          </h1>
          <p className="text-gray-700 mb-4">Este regalo ya fue comprado.</p>
          <Link href={`/gifts/${shareCode}`}>
            <Button className="bg-green-600 hover:bg-green-700">
              Ver Regalo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if participation is still open
  if (gift.status === "open") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingCart className="mx-auto text-orange-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Participación aún abierta
          </h1>
          <p className="text-gray-700 mb-4">
            Primero debes cerrar la participación antes de finalizar la compra.
          </p>
          <Link href={`/gifts/${shareCode}`}>
            <Button>
              <ArrowLeft size={18} className="mr-2" />
              Volver al regalo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // We need participant count - for now estimate from localStorage or show input
  const participantCount = gift.participants?.length || 1;
  const estimatedPricePerPerson = finalPrice
    ? calculatePricePerFamily(parseFloat(finalPrice), participantCount)
    : "0.00";

  // Success screen
  if (success) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center px-4">
            <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Regalo Finalizado!
            </h1>
            <p className="text-gray-700 mb-4">
              Los participantes podrán ver el precio final.
            </p>
            <p className="text-lg font-semibold text-green-600">
              Precio por persona: {estimatedPricePerPerson}€
            </p>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthNudge}
          onClose={() => setShowAuthNudge(false)}
          defaultTab="register"
          headline="¡Regalo completado! ¿Guardamos tus compras?"
          subheadline="Crea una cuenta para ver el historial de todos tus regalos"
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Back link */}
        <Link
          href={`/gifts/${shareCode}`}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          Volver al regalo
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="text-green-500" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Finalizar Compra</h1>
              <p className="text-gray-700">Regalo para {gift.recipient_name}</p>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            {gift.gift_idea && (
              <p className="font-semibold text-lg mb-2">{gift.gift_idea}</p>
            )}
            {gift.estimated_price && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Precio estimado:</span>
                <span className="font-medium">
                  {formatPrice(gift.estimated_price)}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Final Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Final Pagado <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  placeholder="ej: 75.98"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                  €
                </span>
              </div>
              {finalPrice &&
                parseFloat(finalPrice) > 0 &&
                participantCount > 0 && (
                  <p className="mt-2 text-sm text-green-600">
                    Precio por persona:{" "}
                    <strong>{estimatedPricePerPerson}€</strong>
                  </p>
                )}
            </div>

            {/* Receipt Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload size={18} className="inline mr-1" />
                Subir Recibo (opcional)
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />

              {preview && (
                <div className="mt-4">
                  <Image
                    src={preview}
                    alt="Vista previa"
                    className="max-w-full h-auto rounded-lg border max-h-64 object-contain"
                  />
                </div>
              )}

              {receipt && !preview && (
                <p className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                  <FileText size={16} />
                  Archivo: {receipt.name}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={18} className="inline mr-1" />
                Comentario (opcional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="ej: Comprado en Amazon con descuento del 20%"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                className="flex-1"
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Finalizando..." : "Finalizar Compra"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

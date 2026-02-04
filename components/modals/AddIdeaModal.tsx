"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Lightbulb } from "lucide-react";

interface Celebrant {
  birthday_id: string;
  birthdays: {
    id: string;
    child_name: string;
  };
}

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyId: string;
  onSuccess?: () => void;
  preSelectedBirthdayId?: string;
  preSelectedBirthdayName?: string;
}

export function AddIdeaModal({
  isOpen,
  onClose,
  partyId,
  onSuccess,
  preSelectedBirthdayId,
  preSelectedBirthdayName,
}: AddIdeaModalProps) {
  const [celebrants, setCelebrants] = useState<Celebrant[]>([]);
  const [selectedCelebrant, setSelectedCelebrant] = useState(preSelectedBirthdayId || "");
  const [productName, setProductName] = useState("");
  const [productLink, setProductLink] = useState("");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [suggestedBy, setSuggestedBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCelebrants, setIsLoadingCelebrants] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && partyId && !preSelectedBirthdayId) {
      fetchCelebrants();
    }
    // Reset selected celebrant when modal opens
    if (isOpen && preSelectedBirthdayId) {
      setSelectedCelebrant(preSelectedBirthdayId);
    }
  }, [isOpen, partyId, preSelectedBirthdayId]);

  const fetchCelebrants = async () => {
    setIsLoadingCelebrants(true);
    try {
      const response = await fetch(`/api/parties/celebrants?partyId=${partyId}`);
      if (!response.ok) {
        throw new Error("Error al obtener celebrantes");
      }
      const data = await response.json();
      setCelebrants(data.celebrants || []);
    } catch (err) {
      setError("Error al cargar celebrantes");
    } finally {
      setIsLoadingCelebrants(false);
    }
  };

  const resetForm = () => {
    setSelectedCelebrant("");
    setProductName("");
    setProductLink("");
    setPrice("");
    setComment("");
    setSuggestedBy("");
    setError(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): string | null => {
    const birthdayToUse = preSelectedBirthdayId || selectedCelebrant;
    if (!birthdayToUse) {
      return "Selecciona un celebrante";
    }
    if (!productName.trim() || productName.trim().length < 3) {
      return "El nombre del producto debe tener al menos 3 caracteres";
    }
    if (price && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      return "El precio debe ser mayor a 0";
    }
    if (!suggestedBy.trim()) {
      return "El nombre de familia es requerido";
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
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthdayId: preSelectedBirthdayId || selectedCelebrant,
          productName: productName.trim(),
          productLink: productLink.trim() || null,
          price: price ? parseFloat(price) : null,
          comment: comment.trim() || null,
          suggestedBy: suggestedBy.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear idea");
      }

      setShowSuccess(true);

      setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear idea");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Idea de Regalo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-amber-600 mb-4">
          <Lightbulb size={20} />
          <span className="text-sm">Sugiere una idea para el regalo</span>
        </div>

        {/* Pre-selected birthday info */}
        {preSelectedBirthdayId && preSelectedBirthdayName ? (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              Idea para: <strong className="text-blue-700">{preSelectedBirthdayName}</strong>
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celebrante <span className="text-red-500">*</span>
            </label>
            {isLoadingCelebrants ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                Cargando celebrantes...
              </div>
            ) : celebrants.length === 0 ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                No hay celebrantes en esta fiesta
              </div>
            ) : (
              <select
                value={selectedCelebrant}
                onChange={(e) => setSelectedCelebrant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Selecciona un celebrante</option>
                {celebrants.map((celebrant) => (
                  <option key={celebrant.birthday_id} value={celebrant.birthday_id}>
                    {celebrant.birthdays.child_name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del producto <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ej: LEGO Star Wars, Muñeca Barbie..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Link del producto
            <span className="text-gray-700 font-normal"> (opcional)</span>
          </label>
          <input
            type="url"
            value={productLink}
            onChange={(e) => setProductLink(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio aproximado
            <span className="text-gray-700 font-normal"> (opcional)</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700">
              €
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Comentario
            <span className="text-gray-700 font-normal"> (opcional)</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añade cualquier detalle adicional..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSubmitting}
          />
        </div>

        <input type="hidden" name="suggestedBy" value={suggestedBy} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tu nombre de familia <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={suggestedBy}
            onChange={(e) => setSuggestedBy(e.target.value)}
            placeholder="Ej: Familia García"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {showSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
            <Lightbulb size={16} />
            ¡Idea añadida correctamente!
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || isLoadingCelebrants || showSuccess}
            className="flex-1"
          >
            {isSubmitting ? "Guardando..." : "Añadir Idea"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddIdeaModal;

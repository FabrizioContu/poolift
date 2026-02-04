"use client";

import { useState, useEffect } from "react";
import { Modal, Button, Alert } from "@/components/ui";
import { Cake } from "lucide-react";

interface AddBirthdayModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess?: () => void;
}

export function AddBirthdayModal({
  isOpen,
  onClose,
  groupId,
  onSuccess,
}: AddBirthdayModalProps) {
  const [childName, setChildName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setChildName("");
    setBirthDate("");
    setError(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const validateForm = (): string | null => {
    const trimmedName = childName.trim();

    if (!trimmedName) {
      return "El nombre del niño es requerido";
    }
    if (trimmedName.length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    if (trimmedName.length > 50) {
      return "El nombre no puede tener más de 50 caracteres";
    }
    if (!birthDate) {
      return "La fecha de cumpleaños es requerida";
    }

    const selectedDate = new Date(birthDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return "La fecha de cumpleaños no puede ser futura";
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
      const response = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          childName: childName.trim(),
          birthDate,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear cumpleaños");
      }

      setShowSuccess(true);

      setTimeout(() => {
        resetForm();
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cumpleaños");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Añadir Cumpleaños">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-pink-600 mb-4">
          <Cake size={20} />
          <span className="text-sm">Registra un nuevo cumpleaños en el grupo</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del niño <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            placeholder="ej: Juan"
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            {childName.length}/50 caracteres
          </p>
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de cumpleaños <span className="text-red-500">*</span>
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={getTodayDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
        </div>

        {showSuccess && (
          <Alert variant="success">¡Cumpleaños añadido!</Alert>
        )}

        {error && (
          <Alert variant="error">{error}</Alert>
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
            disabled={isSubmitting || showSuccess}
            className="flex-1"
          >
            {isSubmitting ? "Guardando..." : "Añadir Cumpleaños"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddBirthdayModal;

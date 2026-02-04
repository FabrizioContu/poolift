"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void | { error?: string }>;
  title: string;
  message: string;
  warningText?: string;
  dangerous?: boolean;
  confirmText?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningText,
  dangerous = true,
  confirmText = "Eliminar",
}: ConfirmDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await onConfirm();
      // If onConfirm returns an object with error, display it
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setIsLoading(false);
    }
  };

  // Combine external warningText with internal error
  const displayError = error || warningText;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            dangerous ? "bg-red-100" : "bg-orange-100"
          }`}
        >
          <AlertTriangle
            className={`w-8 h-8 ${dangerous ? "text-red-600" : "text-orange-600"}`}
          />
        </div>

        <p className="text-gray-600 mb-4">{message}</p>

        {displayError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm font-medium">{displayError}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant={dangerous ? "danger" : "primary"}
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Eliminando..." : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDeleteModal;

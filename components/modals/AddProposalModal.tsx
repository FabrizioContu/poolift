"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DatePickerInput } from "@/components/ui/DatePickerInput";
import { Plus, Trash2 } from "lucide-react";

interface ProposalItem {
  itemName: string;
  itemPrice: string;
  productLink: string;
}

interface AddProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyId: string;
  onSuccess?: () => void;
}

export function AddProposalModal({
  isOpen,
  onClose,
  partyId,
  onSuccess,
}: AddProposalModalProps) {
  const [name, setName] = useState("");
  const [items, setItems] = useState<ProposalItem[]>([
    { itemName: "", itemPrice: "", productLink: "" },
  ]);
  const [votingDeadline, setVotingDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    setItems([...items, { itemName: "", itemPrice: "", productLink: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (
    index: number,
    field: keyof ProposalItem,
    value: string
  ) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.itemPrice) || 0;
      return sum + price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("El nombre de la propuesta es requerido");
      return;
    }

    const validItems = items.filter((item) => item.itemName.trim());
    if (validItems.length === 0) {
      setError("Agrega al menos un item");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partyId,
          name: name.trim(),
          totalPrice: calculateTotal(),
          votingDeadline: votingDeadline || null,
          items: validItems.map((item) => ({
            itemName: item.itemName.trim(),
            itemPrice: parseFloat(item.itemPrice) || null,
            productLink: item.productLink.trim() || null,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al crear propuesta");
      }

      setName("");
      setItems([{ itemName: "", itemPrice: "", productLink: "" }]);
      setVotingDeadline("");

      onSuccess?.();
      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear propuesta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Propuesta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la propuesta
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Set de LEGO + Peluche"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items
          </label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-700">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) =>
                      updateItem(index, "itemName", e.target.value)
                    }
                    placeholder="Nombre del producto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={item.itemPrice}
                      onChange={(e) =>
                        updateItem(index, "itemPrice", e.target.value)
                      }
                      placeholder="Precio"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      value={item.productLink}
                      onChange={(e) =>
                        updateItem(index, "productLink", e.target.value)
                      }
                      placeholder="Link (opcional)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
          >
            <Plus size={16} />
            Agregar item
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha límite de votación
            <span className="text-gray-700 font-normal"> (opcional)</span>
          </label>
          <DatePickerInput
            value={votingDeadline}
            onChange={setVotingDeadline}
            min={new Date().toISOString().split("T")[0]}
            placeholder="Seleccionar fecha límite"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Total:</span>
            <span className="text-lg font-bold text-blue-600">
              {calculateTotal().toFixed(2)}€
            </span>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Creando..." : "Crear Propuesta"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddProposalModal;

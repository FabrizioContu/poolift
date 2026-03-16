"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus, CheckCircle, Users } from "lucide-react";

interface DirectGiftParticipant {
  id: string;
  participant_name: string;
}

interface DirectGiftParticipationProps {
  giftId: string;
  shareCode: string;
  status: string;
  organizerName: string;
  participants?: DirectGiftParticipant[];
}

export function DirectGiftParticipation({
  giftId,
  shareCode,
  status,
  organizerName,
  participants = [],
}: DirectGiftParticipationProps) {
  const [participantName, setParticipantName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [error, setError] = useState("");
  const [representedBy, setRepresentedBy] = useState<string | null>(null);

  const isOpen = status === "open";

  // Check localStorage on mount
  useEffect(() => {
    // Check if user is the organizer
    const directGifts = localStorage.getItem("poolift_direct_gifts");
    if (directGifts) {
      const gifts = JSON.parse(directGifts);
      const isCreator = gifts.some(
        (g: { shareCode: string }) => g.shareCode === shareCode
      );
      if (isCreator) {
        setIsOrganizer(true);
        setJoined(true);
        setParticipantName(organizerName);
        return;
      }
    }

    // Check if already participating
    const saved = localStorage.getItem(`direct_gift_${giftId}_participant`);
    if (saved) {
      setParticipantName(saved);
      setJoined(true);
      return;
    }

    // Check if represented by an existing participant (family claim)
    // This covers the case where parent B opens the link after parent A already joined
    // and parent A set localStorage on this device (e.g. same phone)
    // OR parent B previously clicked "Soy de esta familia"
    const claimedFamily = localStorage.getItem(
      `direct_gift_${giftId}_represented_by`
    );
    if (claimedFamily) {
      setRepresentedBy(claimedFamily);
    }
  }, [giftId, shareCode, organizerName]);

  const handleClaimRepresentation = (familyName: string) => {
    localStorage.setItem(`direct_gift_${giftId}_represented_by`, familyName);
    setRepresentedBy(familyName);
  };

  const handleJoin = async () => {
    if (!participantName.trim()) {
      setError("Ingresa el nombre de tu familia");
      return;
    }

    if (participantName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName: participantName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al apuntarse");
        return;
      }

      setJoined(true);
      localStorage.setItem(
        `direct_gift_${giftId}_participant`,
        participantName.trim(),
      );
      window.location.reload();
    } catch {
      setError("Error al apuntarse");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al salirse");
        return;
      }

      setJoined(false);
      setParticipantName("");
      localStorage.removeItem(`direct_gift_${giftId}_participant`);
      window.location.reload();
    } catch {
      setError("Error al salirse");
    } finally {
      setLoading(false);
    }
  };

  // Show closed message if participation is closed
  if (!isOpen) {
    if (joined) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center">
            <div className="bg-ocean-mist-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-ocean-mist-400" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              Estás participando
            </h3>
            <p className="text-gray-700">
              Como: <strong>{participantName}</strong>
            </p>
            <p className="text-sm text-gray-700 mt-4">
              La participación está cerrada
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-100 rounded-2xl p-6 text-center">
        <p className="text-gray-700">La participación está cerrada</p>
      </div>
    );
  }

  // Show joined state
  if (joined) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-ocean-mist-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-ocean-mist-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            {isOrganizer ? "Eres el organizador" : "Tu familia está apuntada"}
          </h3>
          <p className="text-gray-700 mb-6">
            Como: <strong>{participantName}</strong>
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!isOrganizer && (
            <Button
              onClick={handleLeave}
              disabled={loading}
              variant="secondary"
              className="text-red-600 hover:bg-red-50"
            >
              <UserMinus size={18} className="mr-2" />
              {loading ? "Saliendo..." : "Salirme del regalo"}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show "already represented" state — family claim via localStorage without a new DB row
  if (representedBy) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-ocean-mist-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-ocean-mist-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            Tu familia ya está representada
          </h3>
          <p className="text-gray-700">
            Representado por: <strong>{representedBy}</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            No necesitas apuntarte de nuevo
          </p>
        </div>
      </div>
    );
  }

  // Show join form
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
        Apúntate al Regalo
      </h3>

      {/* "Already represented" links — show when there are existing participants */}
      {participants.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">¿Tu familia ya está apuntada?</p>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <button
                key={p.id}
                onClick={() => handleClaimRepresentation(p.participant_name)}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700 hover:border-ocean-mist-300 hover:text-ocean-mist-600 transition-colors"
              >
                Soy de {p.participant_name} →
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de tu familia
          </label>
          <input
            type="text"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Ej: Familia García"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-mist-400 focus:border-transparent"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleJoin();
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">Una participación por familia</p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleJoin}
          disabled={loading || !participantName.trim()}
          className="w-full py-3 bg-ocean-mist-400 hover:bg-ocean-mist-500"
        >
          <UserPlus size={20} className="mr-2" />
          {loading ? "Apuntando..." : "Apuntarme"}
        </Button>
      </div>
    </div>
  );
}

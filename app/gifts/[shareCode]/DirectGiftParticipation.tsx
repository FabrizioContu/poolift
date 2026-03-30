"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui-custom/Button";
import { UserPlus, UserMinus, CheckCircle, Users, XCircle } from "lucide-react";

interface DirectGiftParticipant {
  id: string;
  participant_name: string;
  status: "joined" | "declined";
}

interface DirectGiftParticipationProps {
  giftId: string;
  shareCode: string;
  status: string;
  organizerName: string;
  participants?: DirectGiftParticipant[];
}

type ParticipantStatus = "joined" | "declined" | "notAnswered";

function saveToStorage(
  giftId: string,
  name: string,
  status: "joined" | "declined",
) {
  localStorage.setItem(
    `direct_gift_${giftId}_participant`,
    JSON.stringify({ name, status }),
  );
}

export function DirectGiftParticipation({
  giftId,
  shareCode,
  status,
  organizerName,
  participants = [],
}: DirectGiftParticipationProps) {
  const [participantName, setParticipantName] = useState("");
  const [email, setEmail] = useState("");
  const [participantStatus, setParticipantStatus] =
    useState<ParticipantStatus>("notAnswered");
  const [loading, setLoading] = useState(false);
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
        (g: { shareCode: string }) => g.shareCode === shareCode,
      );
      if (isCreator) {
        setIsOrganizer(true);
        setParticipantStatus("joined");
        setParticipantName(organizerName);
        return;
      }
    }

    // Check if already participated (joined or declined)
    const saved = localStorage.getItem(`direct_gift_${giftId}_participant`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null && parsed.name) {
          setParticipantName(parsed.name);
          setParticipantStatus(parsed.status ?? "joined");
        } else {
          // Legacy plain string
          setParticipantName(saved);
          setParticipantStatus("joined");
        }
      } catch {
        // Legacy plain string
        setParticipantName(saved);
        setParticipantStatus("joined");
      }
      return;
    }

    // Check if represented by an existing participant
    const claimedFamily = localStorage.getItem(
      `direct_gift_${giftId}_represented_by`,
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
        body: JSON.stringify({
          participantName: participantName.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al apuntarse");
        return;
      }

      setParticipantStatus("joined");
      saveToStorage(giftId, participantName.trim(), "joined");
      window.location.reload();
    } catch {
      setError("Error al apuntarse");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
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
        body: JSON.stringify({
          participantName: participantName.trim(),
          declined: true,
          email: email.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrar respuesta");
        return;
      }

      setParticipantStatus("declined");
      saveToStorage(giftId, participantName.trim(), "declined");
    } catch {
      setError("Error al registrar respuesta");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToDeclined = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName,
          declined: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al registrar respuesta");
        return;
      }

      setParticipantStatus("declined");
      saveToStorage(giftId, participantName, "declined");
    } catch {
      setError("Error al registrar respuesta");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToJoined = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gifts/direct/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al apuntarse");
        return;
      }

      setParticipantStatus("joined");
      saveToStorage(giftId, participantName, "joined");
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

      setParticipantStatus("notAnswered");
      setParticipantName("");
      localStorage.removeItem(`direct_gift_${giftId}_participant`);
      window.location.reload();
    } catch {
      setError("Error al salirse");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveResponse = async () => {
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
        setError(data.error || "Error al quitar respuesta");
        return;
      }

      setParticipantStatus("notAnswered");
      setParticipantName("");
      localStorage.removeItem(`direct_gift_${giftId}_participant`);
      window.location.reload();
    } catch {
      setError("Error al quitar respuesta");
    } finally {
      setLoading(false);
    }
  };

  // Participation closed
  if (!isOpen) {
    if (participantStatus === "joined") {
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

  // Joined state
  if (participantStatus === "joined") {
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
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleLeave}
                disabled={loading}
                variant="secondary"
                className="text-red-600 hover:bg-red-50"
              >
                <UserMinus size={18} className="mr-2" />
                {loading ? "Saliendo..." : "Salirme del regalo"}
              </Button>
              <Button
                onClick={handleSwitchToDeclined}
                disabled={loading}
                variant="secondary"
                className="text-gray-500 hover:bg-gray-50 text-sm"
              >
                <XCircle size={16} className="mr-2" />
                {loading ? "..." : "Ya no puedo participar"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Declined state
  if (participantStatus === "declined") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            No vas a participar
          </h3>
          <p className="text-gray-700 mb-6">
            Como: <strong>{participantName}</strong>
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSwitchToJoined}
              disabled={loading}
              className="bg-ocean-mist-400 hover:bg-ocean-mist-500"
            >
              <UserPlus size={18} className="mr-2" />
              {loading ? "..." : "Cambié de opinión — Unirme"}
            </Button>
            <Button
              onClick={handleRemoveResponse}
              disabled={loading}
              variant="secondary"
              className="text-gray-500 hover:bg-gray-50 text-sm"
            >
              {loading ? "..." : "Quitar mi respuesta"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Already represented state
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

  // Join form (notAnswered state)
  const joinedParticipants = participants.filter((p) => p.status === "joined");

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
        Apúntate al Regalo
      </h3>

      {joinedParticipants.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">
            ¿Tu familia ya está apuntada?
          </p>
          <div className="flex flex-wrap gap-2">
            {joinedParticipants.map((p) => (
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
            className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-mist-400 focus:border-transparent"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleJoin();
              }
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Una participación por familia
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tu email (opcional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: juan@email.com"
            className="w-full text-gray-700 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ocean-mist-400 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Para avisarte cuando la participación se cierre o el regalo se compre
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleJoin}
            disabled={loading || !participantName.trim()}
            className="w-full py-3 bg-ocean-mist-400 hover:bg-ocean-mist-500"
          >
            <UserPlus size={20} className="mr-2" />
            {loading ? "Apuntando..." : "Apuntarme"}
          </Button>
          <Button
            onClick={handleDecline}
            disabled={loading || !participantName.trim()}
            variant="secondary"
            className="w-full py-2 text-gray-500 hover:bg-gray-50 text-sm"
          >
            <XCircle size={16} className="mr-2" />
            {loading ? "..." : "No voy a participar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

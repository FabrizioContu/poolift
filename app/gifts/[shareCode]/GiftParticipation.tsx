"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { UserPlus, UserMinus, CheckCircle } from "lucide-react";

interface GiftParticipationProps {
  giftId: string;
  shareCode: string;
  participationOpen: boolean;
  isPurchased: boolean;
  coordinatorName: string | null;
  groupId: string | null;
}

export function GiftParticipation({
  giftId,
  shareCode,
  participationOpen,
  isPurchased,
  coordinatorName,
  groupId,
}: GiftParticipationProps) {
  const [familyName, setFamilyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [error, setError] = useState("");

  // Check localStorage on mount
  useEffect(() => {
    // Check if user is the coordinator (from group sessions)
    if (groupId && coordinatorName) {
      const sessions = localStorage.getItem("poolift_groups");
      if (sessions) {
        const groupSessions = JSON.parse(sessions);
        const session = groupSessions.find(
          (s: { groupId: string; familyName: string }) => s.groupId === groupId
        );
        if (session && session.familyName.toLowerCase() === coordinatorName.toLowerCase()) {
          setIsCoordinator(true);
          setJoined(true);
          setFamilyName(session.familyName);
          return;
        }
      }
    }

    // Check if already participating (from localStorage)
    const saved = localStorage.getItem(`gift_${giftId}_family`);
    if (saved) {
      setFamilyName(saved);
      setJoined(true);
    }
  }, [giftId, groupId, coordinatorName]);

  const handleJoin = async () => {
    if (!familyName.trim()) {
      setError("Ingresa el nombre de tu familia");
      return;
    }

    if (familyName.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/gifts/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName: familyName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al apuntarse");
        return;
      }

      setJoined(true);
      localStorage.setItem(`gift_${giftId}_family`, familyName.trim());
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
      const response = await fetch(`/api/gifts/${giftId}/participate`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al salirse");
        return;
      }

      setJoined(false);
      setFamilyName("");
      localStorage.removeItem(`gift_${giftId}_family`);
      window.location.reload();
    } catch {
      setError("Error al salirse");
    } finally {
      setLoading(false);
    }
  };

  // Show closed message if participation is closed
  if (!participationOpen || isPurchased) {
    if (joined) {
      return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">
              ¡Estás participando!
            </h3>
            <p className="text-gray-700">
              Familia: <strong>{familyName}</strong>
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
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">
            {isCoordinator ? "Eres el coordinador" : "¡Estás apuntado!"}
          </h3>
          <p className="text-gray-700 mb-6">
            Familia: <strong>{familyName}</strong>
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!isCoordinator && (
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

  // Show join form
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4 text-center text-gray-900">
        Apúntate al Regalo
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de tu familia
          </label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="ej: Familia García"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleJoin();
              }
            }}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button
          onClick={handleJoin}
          disabled={loading || !familyName.trim()}
          className="w-full py-3"
        >
          <UserPlus size={20} className="mr-2" />
          {loading ? "Apuntando..." : "Apuntarme"}
        </Button>
      </div>
    </div>
  );
}

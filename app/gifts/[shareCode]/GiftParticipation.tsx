"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui-custom/Button";
import { UserPlus, UserMinus, CheckCircle, Users, XCircle } from "lucide-react";

interface GiftParticipant {
  id: string;
  family_name: string;
  status: "joined" | "declined";
}

interface GiftParticipationProps {
  giftId: string;
  participationOpen: boolean;
  isPurchased: boolean;
  coordinatorName: string | null;
  groupId: string | null;
  participants?: GiftParticipant[];
}

type ParticipantStatus = "joined" | "declined" | "notAnswered";

function saveToStorage(
  giftId: string,
  name: string,
  status: "joined" | "declined",
) {
  localStorage.setItem(
    `gift_${giftId}_family`,
    JSON.stringify({ name, status }),
  );
}

export function GiftParticipation({
  giftId,
  participationOpen,
  isPurchased,
  coordinatorName,
  groupId,
  participants = [],
}: GiftParticipationProps) {
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [participantStatus, setParticipantStatus] =
    useState<ParticipantStatus>("notAnswered");
  const [loading, setLoading] = useState(false);
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [error, setError] = useState("");
  const [representedBy, setRepresentedBy] = useState<string | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    // Check if user is the coordinator (from group sessions)
    if (groupId && coordinatorName) {
      const sessions = localStorage.getItem("poolift_groups");
      if (sessions) {
        const groupSessions = JSON.parse(sessions);
        const session = groupSessions.find(
          (s: { groupId: string; familyName: string }) => s.groupId === groupId,
        );
        if (
          session &&
          session.familyName.toLowerCase() === coordinatorName.toLowerCase()
        ) {
          setIsCoordinator(true);
          setParticipantStatus("joined");
          setFamilyName(session.familyName);
          return;
        }
      }
    }

    // Check if already participated (joined or declined)
    const saved = localStorage.getItem(`gift_${giftId}_family`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null && parsed.name) {
          setFamilyName(parsed.name);
          setParticipantStatus(parsed.status ?? "joined");
        } else {
          // Legacy plain string
          setFamilyName(saved);
          setParticipantStatus("joined");
        }
      } catch {
        // Legacy plain string
        setFamilyName(saved);
        setParticipantStatus("joined");
      }
      return;
    }

    // Check if represented by an existing participant
    const claimedFamily = localStorage.getItem(`gift_${giftId}_represented_by`);
    if (claimedFamily) {
      setRepresentedBy(claimedFamily);
    }
  }, [giftId, groupId, coordinatorName]);

  const handleClaimRepresentation = (claimedFamilyName: string) => {
    localStorage.setItem(`gift_${giftId}_represented_by`, claimedFamilyName);
    setRepresentedBy(claimedFamilyName);
  };

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
        body: JSON.stringify({ familyName: familyName.trim(), email: email.trim() || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al apuntarse");
        return;
      }

      setParticipantStatus("joined");
      saveToStorage(giftId, familyName.trim(), "joined");
      window.location.reload();
    } catch {
      setError("Error al apuntarse");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
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
        body: JSON.stringify({ familyName: familyName.trim(), declined: true, email: email.trim() || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al registrar respuesta");
        return;
      }

      setParticipantStatus("declined");
      saveToStorage(giftId, familyName.trim(), "declined");
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
      const response = await fetch(`/api/gifts/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName, declined: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al registrar respuesta");
        return;
      }

      setParticipantStatus("declined");
      saveToStorage(giftId, familyName, "declined");
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
      const response = await fetch(`/api/gifts/${giftId}/participate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al apuntarse");
        return;
      }

      setParticipantStatus("joined");
      saveToStorage(giftId, familyName, "joined");
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

      setParticipantStatus("notAnswered");
      setFamilyName("");
      localStorage.removeItem(`gift_${giftId}_family`);
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
      const response = await fetch(`/api/gifts/${giftId}/participate`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ familyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Error al quitar respuesta");
        return;
      }

      setParticipantStatus("notAnswered");
      setFamilyName("");
      localStorage.removeItem(`gift_${giftId}_family`);
      window.location.reload();
    } catch {
      setError("Error al quitar respuesta");
    } finally {
      setLoading(false);
    }
  };

  // Participation closed
  if (!participationOpen || isPurchased) {
    if (participantStatus === "joined") {
      return (
        <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-emerald-500" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-foreground">
              ¡Estás participando!
            </h3>
            <p className="text-muted-foreground">
              Familia: <strong>{familyName}</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              La participación está cerrada
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-muted rounded-2xl p-6 text-center">
        <p className="text-muted-foreground">La participación está cerrada</p>
      </div>
    );
  }

  // Joined state
  if (participantStatus === "joined") {
    return (
      <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">
            {isCoordinator ? "Eres el coordinador" : "¡Estás apuntado!"}
          </h3>
          <p className="text-muted-foreground mb-6">
            Familia: <strong>{familyName}</strong>
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {!isCoordinator && (
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
                className="text-muted-foreground hover:bg-gray-50 text-sm"
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
      <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="text-muted-foreground/60" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">
            No vas a participar
          </h3>
          <p className="text-muted-foreground mb-6">
            Familia: <strong>{familyName}</strong>
          </p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSwitchToJoined}
              disabled={loading}
              className="w-full"
            >
              <UserPlus size={18} className="mr-2" />
              {loading ? "..." : "Cambié de opinión — Unirme"}
            </Button>
            <Button
              onClick={handleRemoveResponse}
              disabled={loading}
              variant="secondary"
              className="text-muted-foreground hover:bg-gray-50 text-sm"
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
      <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <div className="bg-primary/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-primary" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2 text-foreground">
            Tu familia ya está representada
          </h3>
          <p className="text-muted-foreground">
            Representado por: <strong>{representedBy}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            No necesitas apuntarte de nuevo
          </p>
        </div>
      </div>
    );
  }

  // Join form (notAnswered state)
  const joinedParticipants = participants.filter((p) => p.status === "joined");

  return (
    <div className="bg-background rounded-2xl shadow-xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-4 text-center text-foreground">
        Apúntate al Regalo
      </h3>

      {joinedParticipants.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">
            ¿Tu familia ya está apuntada?
          </p>
          <div className="flex flex-wrap gap-2">
            {joinedParticipants.map((p) => (
              <button
                key={p.id}
                onClick={() => handleClaimRepresentation(p.family_name)}
                className="text-xs bg-background border border-border rounded-full px-3 py-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                Soy de {p.family_name} →
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Nombre de tu familia
          </label>
          <input
            type="text"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            placeholder="ej: Familia García"
            className="w-full px-4 py-3 text-muted-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleJoin();
              }
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Tu email (opcional)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ej: familia@email.com"
            className="w-full px-4 py-3 text-muted-foreground border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Para avisarte cuando la participación se cierre o el regalo se compre
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-2">
          <Button
            onClick={handleJoin}
            disabled={loading || !familyName.trim()}
            className="w-full py-3"
          >
            <UserPlus size={20} className="mr-2" />
            {loading ? "Apuntando..." : "Apuntarme"}
          </Button>
          <Button
            onClick={handleDecline}
            disabled={loading || !familyName.trim()}
            variant="secondary"
            className="w-full py-2 text-muted-foreground hover:bg-gray-50 text-sm"
          >
            <XCircle size={16} className="mr-2" />
            {loading ? "..." : "No voy a participar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

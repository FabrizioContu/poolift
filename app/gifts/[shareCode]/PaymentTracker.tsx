"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { useIsCoordinator } from "@/lib/hooks/useIsCoordinator";

interface Participant {
  id: string;
  name: string;
  joined_at: string;
  paid: boolean;
}

interface PaymentListProps {
  participants: Participant[];
  isPurchased: boolean;
  canManage: boolean;
  onToggle: (name: string, paid: boolean) => Promise<void>;
}

function PaymentList({ participants, isPurchased, canManage, onToggle }: PaymentListProps) {
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const paidCount = participants.filter(
    (p) => (p.name in optimistic ? optimistic[p.name] : p.paid),
  ).length;

  const handleToggle = async (p: Participant) => {
    const currentPaid = p.name in optimistic ? optimistic[p.name] : p.paid;
    const nextPaid = !currentPaid;
    setOptimistic((prev) => ({ ...prev, [p.name]: nextPaid }));
    setLoading((prev) => ({ ...prev, [p.name]: true }));
    try {
      await onToggle(p.name, nextPaid);
    } catch {
      setOptimistic((prev) => ({ ...prev, [p.name]: currentPaid }));
    } finally {
      setLoading((prev) => ({ ...prev, [p.name]: false }));
    }
  };

  return (
    <div>
      {isPurchased && (
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-sm text-muted-foreground">Estado de pagos</span>
          <span className={`text-sm font-semibold ${paidCount === participants.length ? "text-emerald-600" : "text-amber-600"}`}>
            {paidCount} de {participants.length} {participants.length === 1 ? "ha pagado" : "han pagado"}
          </span>
        </div>
      )}

      <ul className="space-y-2">
        {participants.map((p) => {
          const isPaid = p.name in optimistic ? optimistic[p.name] : p.paid;
          const isLoading = loading[p.name] ?? false;

          return (
            <li
              key={p.id}
              className="flex items-center justify-between p-3 bg-muted rounded-lg"
            >
              <span className="font-medium text-foreground">{p.name}</span>

              <div className="flex items-center gap-2">
                {isPurchased && (
                  isPaid ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} />
                      Pagado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full">
                      <Clock size={12} />
                      Pendiente
                    </span>
                  )
                )}

                {isPurchased && canManage && (
                  <button
                    onClick={() => handleToggle(p)}
                    disabled={isLoading}
                    className="text-xs text-primary hover:text-primary/70 underline underline-offset-2 disabled:opacity-40 transition-opacity"
                  >
                    {isLoading ? "..." : isPaid ? "Desmarcar" : "Marcar pagado"}
                  </button>
                )}

                {!isPurchased && (
                  <span className="text-sm text-muted-foreground">
                    {new Date(p.joined_at).toLocaleDateString("es-ES")}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Direct Gift variant ─────────────────────────────────────────────────────

interface DirectGiftPaymentTrackerProps {
  giftId: string;
  participants: Array<{ id: string; participant_name: string; joined_at: string; paid: boolean }>;
  isPurchased: boolean;
}

export function DirectGiftPaymentTracker({
  giftId,
  participants,
  isPurchased,
}: DirectGiftPaymentTrackerProps) {
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`direct_gift_${giftId}_organizer`);
    setIsOrganizer(!!saved);
  }, [giftId]);

  const mapped = participants.map((p) => ({
    id: p.id,
    name: p.participant_name,
    joined_at: p.joined_at,
    paid: p.paid,
  }));

  const handleToggle = async (participantName: string, paid: boolean) => {
    const res = await fetch(`/api/gifts/direct/${giftId}/participants/pay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantName, paid }),
    });
    if (!res.ok) throw new Error("Error al actualizar pago");
  };

  return (
    <PaymentList
      participants={mapped}
      isPurchased={isPurchased}
      canManage={isOrganizer}
      onToggle={handleToggle}
    />
  );
}

// ─── Group Gift variant ──────────────────────────────────────────────────────

interface GroupGiftPaymentTrackerProps {
  giftId: string;
  participants: Array<{ id: string; family_name: string; joined_at: string; paid: boolean }>;
  isPurchased: boolean;
  coordinatorId: string | null;
  groupId: string | null;
}

export function GroupGiftPaymentTracker({
  giftId,
  participants,
  isPurchased,
  coordinatorId,
  groupId,
}: GroupGiftPaymentTrackerProps) {
  const isCoordinator = useIsCoordinator(coordinatorId, groupId ?? "");

  const mapped = participants.map((p) => ({
    id: p.id,
    name: p.family_name,
    joined_at: p.joined_at,
    paid: p.paid,
  }));

  const handleToggle = async (familyName: string, paid: boolean) => {
    const res = await fetch(`/api/gifts/${giftId}/participants/pay`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ familyName, paid }),
    });
    if (!res.ok) throw new Error("Error al actualizar pago");
  };

  return (
    <PaymentList
      participants={mapped}
      isPurchased={isPurchased}
      canManage={isCoordinator}
      onToggle={handleToggle}
    />
  );
}

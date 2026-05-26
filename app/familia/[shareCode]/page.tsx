"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { addGroupToSession, useAuth } from "@/lib/auth";
import { anonymousStorage } from "@/lib/storage";

interface FamilyData {
  family: { id: string; name: string; group_id: string; share_code: string; is_creator: boolean };
  group: { id: string; name: string; invite_code: string };
}

export default function FamiliaShareCodePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const shareCode = params.shareCode as string;

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [groupId, setGroupId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    async function restoreAccess() {
      try {
        const res = await fetch(`/api/families/share/${shareCode}`);
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Código inválido");
          setStatus("error");
          return;
        }

        const { family, group }: FamilyData = await res.json();

        // Restore localStorage access
        anonymousStorage.addGroup(group.id);
        addGroupToSession({
          groupId: group.id,
          groupName: group.name,
          familyId: family.id,
          familyName: family.name,
          isCreator: family.is_creator,
          inviteCode: group.invite_code,
        });

        // If authenticated, link user_id to this family
        if (user) {
          await fetch(`/api/families/share/${shareCode}`, { method: "POST" });
        }

        setGroupId(group.id);
        setStatus("success");

        setTimeout(() => {
          router.push(`/dashboard/${group.id}`);
        }, 1500);
      } catch {
        setErrorMsg("Error al verificar el código. Intentalo de nuevo.");
        setStatus("error");
      }
    }

    restoreAccess();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareCode]);

  return (
    <main className="min-h-screen bg-linear-to-b from-primary/10 to-background flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-background rounded-lg border border-border p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-foreground">Verificando tu código...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">¡Acceso restaurado!</h1>
            <p className="text-muted-foreground">Redirigiendo al dashboard...</p>
            {groupId && (
              <Link
                href={`/dashboard/${groupId}`}
                className="mt-4 inline-block text-primary hover:underline text-sm"
              >
                Ir ahora
              </Link>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Código inválido</h1>
            <p className="text-muted-foreground mb-6">{errorMsg}</p>
            <Link
              href="/join?tab=familia"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
            >
              Intentar con otro código
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui-custom/Modal";
import { Button } from "@/components/ui-custom/Button";
import { Check, Copy, Link as LinkIcon, MessageCircle, PartyPopper } from "lucide-react";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  groupId: string;
  groupName: string;
  familyShareCode?: string;
}

export function InviteCodeModal({
  isOpen,
  onClose,
  inviteCode,
  groupId,
  groupName,
  familyShareCode,
}: InviteCodeModalProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const inviteLink = typeof window !== "undefined"
    ? `${window.location.origin}/join/${inviteCode}`
    : `/join/${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Error copying code:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error("Error copying link:", err);
    }
  };

  const handleCopyShareCode = async () => {
    if (!familyShareCode) return;
    try {
      await navigator.clipboard.writeText(familyShareCode);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error("Error copying share code:", err);
    }
  };

  const handleShareWhatsApp = () => {
    const message = `¡Únete a nuestro grupo "${groupName}" en Poolift para organizar regalos de cumpleaños!\n\nUsa este código: ${inviteCode}\n\nO entra directamente: ${inviteLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleGoToDashboard = () => {
    router.push(`/dashboard/${groupId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¡Grupo Creado!">
      <div className="text-center">
        <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-emerald-800">
          <PartyPopper className="w-8 h-8 text-emerald-500 dark:text-emerald-300" />
        </div>

        <p className="text-muted-foreground mb-6">
          Tu grupo <span className="font-semibold">{groupName}</span> ha sido creado.
          Comparte el código con las familias del grupo.
        </p>

        <div className="bg-muted rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">Código de invitación</p>
          <p className="text-3xl font-mono font-bold text-primary tracking-wider">
            {inviteCode}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Button
            variant="secondary"
            onClick={handleCopyCode}
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            {copiedCode ? (
              <>
                <Check size={20} className="text-emerald-500" />
                <span className="text-emerald-500">¡Código copiado!</span>
              </>
            ) : (
              <>
                <Copy size={20} />
                <span>Copiar Código</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3"
          >
            {copiedLink ? (
              <>
                <Check size={20} className="text-emerald-500" />
                <span className="text-emerald-500">¡Link copiado!</span>
              </>
            ) : (
              <>
                <LinkIcon size={20} />
                <span>Copiar Link</span>
              </>
            )}
          </Button>

          <Button
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 hover:bg-emerald-500"
          >
            <MessageCircle size={20} />
            <span>Compartir en WhatsApp</span>
          </Button>
        </div>

        {familyShareCode && (
          <div className="mt-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-left dark:bg-amber-900/20 dark:border-amber-700">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
              Tu código personal de acceso
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
              Guardalo — te permite volver a entrar al grupo desde cualquier dispositivo sin necesidad de cuenta
            </p>
            <div className="flex items-center justify-between bg-amber-100 dark:bg-amber-900/40 rounded-lg px-4 py-2">
              <span className="font-mono font-bold tracking-widest text-amber-900 dark:text-amber-200">
                {familyShareCode}
              </span>
              <button
                onClick={handleCopyShareCode}
                className="ml-3 p-1.5 rounded-md hover:bg-amber-200 dark:hover:bg-amber-800 transition text-amber-700 dark:text-amber-300"
                aria-label="Copiar código de familia"
              >
                {copiedShare ? (
                  <Check size={16} className="text-emerald-600" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        <Button onClick={handleGoToDashboard} className="w-full py-3">
          Ir al Dashboard
        </Button>
      </div>
    </Modal>
  );
}

export default InviteCodeModal;

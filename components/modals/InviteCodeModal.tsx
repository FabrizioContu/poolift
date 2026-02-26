"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Check, Copy, Link as LinkIcon, MessageCircle, PartyPopper } from "lucide-react";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteCode: string;
  groupId: string;
  groupName: string;
}

export function InviteCodeModal({
  isOpen,
  onClose,
  inviteCode,
  groupId,
  groupName,
}: InviteCodeModalProps) {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8 text-green-600" />
        </div>

        <p className="text-gray-700 mb-6">
          Tu grupo <span className="font-semibold">{groupName}</span> ha sido creado.
          Comparte el código con las familias del grupo.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-2">Código de invitación</p>
          <p className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
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
                <Check size={20} className="text-green-600" />
                <span className="text-green-600">¡Código copiado!</span>
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
                <Check size={20} className="text-green-600" />
                <span className="text-green-600">¡Link copiado!</span>
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600"
          >
            <MessageCircle size={20} />
            <span>Compartir en WhatsApp</span>
          </Button>
        </div>

        <Button onClick={handleGoToDashboard} className="w-full py-3">
          Ir al Dashboard
        </Button>
      </div>
    </Modal>
  );
}

export default InviteCodeModal;

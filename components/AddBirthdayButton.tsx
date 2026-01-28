"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

const AddBirthdayModal = dynamic(
  () => import("@/components/modals/AddBirthdayModal"),
);

interface AddBirthdayButtonProps {
  groupId: string;
}

export function AddBirthdayButton({ groupId }: AddBirthdayButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)}>
        Añadir Cumpleaños
      </Button>

      {showModal && (
        <AddBirthdayModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          groupId={groupId}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

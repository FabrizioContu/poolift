"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";

const CreatePartyModal = dynamic(
  () => import("@/components/modals/CreatePartyModal"),
);

interface Birthday {
  id: string;
  child_name: string;
  birth_date: string;
}

interface Family {
  id: string;
  name: string;
}

export function CreatePartyButton({ groupId }: { groupId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);

  useEffect(() => {
    if (showModal) {
      Promise.all([
        fetch(`/api/birthdays?groupId=${groupId}`).then((res) => res.json()),
        fetch(`/api/families?groupId=${groupId}`).then((res) => res.json()),
      ]).then(([birthdaysData, familiesData]) => {
        setBirthdays(birthdaysData.birthdays || []);
        setFamilies(familiesData.families || []);
      });
    }
  }, [showModal, groupId]);

  const handleSuccess = () => {
    window.location.reload();
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>Crear Fiesta</Button>

      {showModal && (
        <CreatePartyModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          groupId={groupId}
          birthdays={birthdays}
          families={families}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

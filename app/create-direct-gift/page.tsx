"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateDirectGiftModal } from "@/components/modals/CreateDirectGiftModal";

export default function CreateDirectGiftPage() {
  const router = useRouter();
  const [isOpen] = useState(true);

  const handleClose = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white">
      {/* Background with back button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* Modal */}
      <CreateDirectGiftModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}

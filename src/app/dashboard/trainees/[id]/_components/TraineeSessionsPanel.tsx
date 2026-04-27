"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SessionEntry, SessionsPanel } from "@/app/components/SessionsPanel";
import { SessionFormModal } from "@/app/dashboard/_components/SessionFormModal";

export function TraineeSessionsPanel({
  traineeId,
  sessions,
  accentColor,
}: {
  traineeId: string;
  sessions: SessionEntry[];
  accentColor: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<SessionEntry | null>(null);

  function openNew() {
    setEditing(null);
    setIsOpen(true);
  }

  function openEdit(session: SessionEntry) {
    setEditing(session);
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    setEditing(null);
  }

  function handleSuccess() {
    handleClose();
    router.refresh();
  }

  return (
    <>
      <SessionsPanel
        sessions={sessions}
        accentColor={accentColor}
        onNewSession={openNew}
        onEditSession={openEdit}
      />
      <SessionFormModal
        isOpen={isOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        traineeId={traineeId}
        initialData={editing}
        accentColor={accentColor}
      />
    </>
  );
}

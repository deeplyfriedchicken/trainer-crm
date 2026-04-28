"use client";

import { useState } from "react";
import { LuUserPlus } from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { AddTrainerModal } from "./AddTrainerModal";

export function AddTrainerButton({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        colorScheme="cyan"
        onClick={() => setOpen(true)}
        display="flex"
        alignItems="center"
        gap="6px"
      >
        <LuUserPlus size={14} />
        Add Trainer
      </Button>
      <AddTrainerModal
        isOpen={open}
        onClose={() => setOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
}

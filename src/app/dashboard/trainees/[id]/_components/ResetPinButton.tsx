"use client";

import { useState, useTransition } from "react";
import { LuKeyRound } from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import { resetTraineePin } from "../actions";

export function ResetPinButton({ traineeId }: { traineeId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await resetTraineePin(traineeId);
      setOpen(false);
    });
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LuKeyRound size={13} />
        Reset PIN
      </Button>

      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Reset PIN"
        maxWidth={420}
      >
        <DialogBody>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            This will clear the trainee's PIN. They will be prompted to create a
            new one the next time they access their client portal.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button
              variant="solid"
              colorScheme="cyan"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="pink"
              size="sm"
              loading={isPending}
              onClick={handleConfirm}
            >
              Reset PIN
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

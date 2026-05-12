"use client";

import { useState } from "react";
import { LuLink } from "react-icons/lu";
import { Button } from "@/app/components/Button";

interface Props {
  traineeId: string;
}

export function ClientPortalLink({ traineeId }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "copied" | "error">(
    "idle",
  );

  const handleCopy = async () => {
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch(`/api/trainees/${traineeId}/portal-link`);
      if (!res.ok) throw new Error("Failed to generate link");
      const { data } = await res.json();
      await navigator.clipboard.writeText(data.url);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  const isCopied = state === "copied";
  const isError = state === "error";
  const isLoading = state === "loading";

  return (
    <Button
      variant="outline"
      colorScheme={isError ? "red" : "neutral"}
      size="sm"
      onClick={handleCopy}
      disabled={isLoading}
      style={
        isCopied
          ? { borderColor: "rgba(52,253,254,0.3)", color: "var(--color-cyan)" }
          : undefined
      }
    >
      <LuLink size={13} />
      {isCopied
        ? "Copied!"
        : isError
          ? "Failed"
          : isLoading
            ? "Generating…"
            : "Client Portal Link"}
    </Button>
  );
}

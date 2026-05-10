"use client";

import { useState } from "react";
import { LuLink } from "react-icons/lu";

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
      const { data } = (await res.json()) as { data: { url: string } };
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
    <button
      onClick={handleCopy}
      disabled={isLoading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        background: isCopied
          ? "rgba(52,253,254,0.12)"
          : isError
            ? "rgba(248,113,113,0.12)"
            : "rgba(255,255,255,0.05)",
        border: `1px solid ${isCopied ? "rgba(52,253,254,0.3)" : isError ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: isCopied
          ? "var(--color-secondary)"
          : isError
            ? "#f87171"
            : "rgba(255,255,255,0.6)",
        fontSize: 12,
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        cursor: isLoading ? "default" : "pointer",
        opacity: isLoading ? 0.6 : 1,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      type="button"
    >
      <LuLink size={13} />
      {isCopied ? "Copied!" : isError ? "Failed" : isLoading ? "Generating…" : "Client Portal Link"}
    </button>
  );
}

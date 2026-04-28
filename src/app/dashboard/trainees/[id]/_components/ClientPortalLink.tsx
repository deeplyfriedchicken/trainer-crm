"use client";

import { useState } from "react";
import { LuLink } from "react-icons/lu";

interface Props {
  encryptedToken: string;
}

export function ClientPortalLink({ encryptedToken }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/client/${encryptedToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 8,
        background: copied ? "rgba(52,253,254,0.12)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${copied ? "rgba(52,253,254,0.3)" : "rgba(255,255,255,0.1)"}`,
        color: copied ? "var(--neon-cyan)" : "rgba(255,255,255,0.6)",
        fontSize: 12,
        fontFamily: "var(--font-neon-body)",
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
      type="button"
    >
      <LuLink size={13} />
      {copied ? "Copied!" : "Client Portal Link"}
    </button>
  );
}

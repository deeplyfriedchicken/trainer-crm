"use client";

import { chakra } from "@chakra-ui/react";

export interface StatPillProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: string | number;
  unit?: string;
  colorScheme?: "pink" | "cyan";
}

function StatPillBase({
  label,
  value,
  unit,
  colorScheme = "cyan",
  ...rest
}: StatPillProps) {
  const color = `var(--color-${colorScheme})`;
  return (
    <div
      style={{
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "12px 8px",
        textAlign: "center",
      }}
      {...rest}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--color-text-dim)",
          fontWeight: 700,
          marginBottom: 4,
          fontFamily: "var(--font-mono, monospace)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display, sans-serif)",
          fontSize: 28,
          fontWeight: 800,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {unit && (
        <div
          style={{
            fontSize: 10,
            color: "var(--color-text-dim)",
            fontFamily: "var(--font-mono, monospace)",
            marginTop: 2,
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}

export const StatPill = chakra(StatPillBase);

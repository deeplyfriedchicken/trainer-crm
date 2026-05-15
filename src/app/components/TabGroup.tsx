"use client";

import type { NeonColorScheme } from "./Button";

interface TabGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  colorScheme?: NeonColorScheme;
  children: React.ReactNode;
}

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  colorScheme?: NeonColorScheme;
  children: React.ReactNode;
}

export function TabGroup({
  colorScheme: _colorScheme,
  children,
  style,
  ...rest
}: TabGroupProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: 3,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Tab({
  active,
  colorScheme = "pink",
  children,
  style,
  ...rest
}: TabProps) {
  const color =
    colorScheme === "neutral"
      ? "rgba(255,255,255,0.55)"
      : `var(--color-${colorScheme})`;
  const activeBg =
    colorScheme === "neutral"
      ? "rgba(255,255,255,0.1)"
      : `var(--color-${colorScheme})1e`;
  const activeBorder =
    colorScheme === "neutral"
      ? "rgba(255,255,255,0.2)"
      : `var(--color-${colorScheme})33`;

  return (
    <button
      type="button"
      style={{
        flex: 1,
        padding: "7px 12px",
        border: active ? `1px solid ${activeBorder}` : "1px solid transparent",
        cursor: "pointer",
        borderRadius: 8,
        fontFamily: "var(--font-body), sans-serif",
        fontSize: 13,
        fontWeight: 600,
        background: active ? activeBg : "transparent",
        color: active ? color : "var(--color-text-muted)",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
        whiteSpace: "nowrap",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

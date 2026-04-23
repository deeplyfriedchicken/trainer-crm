"use client";

import {
  Separator as ChakraSeparator,
  type SeparatorProps,
} from "@chakra-ui/react";

export interface NeonSeparatorProps extends SeparatorProps {
  accent?: "pink" | "cyan" | "none";
}

export function Separator({ accent = "none", ...rest }: NeonSeparatorProps) {
  const color =
    accent === "pink"
      ? "var(--neon-pink)"
      : accent === "cyan"
        ? "var(--neon-cyan)"
        : "var(--neon-border)";
  return (
    <ChakraSeparator
      borderColor={color}
      opacity={accent === "none" ? 1 : 0.5}
      boxShadow={accent === "none" ? undefined : `0 0 8px ${color}55`}
      {...rest}
    />
  );
}

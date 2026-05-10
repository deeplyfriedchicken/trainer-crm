"use client";

import {
  Separator as ChakraSeparator,
  chakra,
  type SeparatorProps,
} from "@chakra-ui/react";

export interface NeonSeparatorProps extends SeparatorProps {
  accent?: "pink" | "cyan" | "none";
}

function SeparatorBase({ accent = "none", ...rest }: NeonSeparatorProps) {
  const color =
    accent === "pink"
      ? "var(--color-primary)"
      : accent === "cyan"
        ? "var(--color-secondary)"
        : "var(--color-border)";
  return (
    <ChakraSeparator
      borderColor={color}
      opacity={accent === "none" ? 1 : 0.5}
      boxShadow={accent === "none" ? undefined : `0 0 8px ${color}55`}
      {...rest}
    />
  );
}

export const Separator = chakra(SeparatorBase);

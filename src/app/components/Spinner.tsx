"use client";

import { Box } from "@chakra-ui/react";
import type { NeonColorScheme, NeonSize } from "./Button";

export interface NeonSpinnerProps {
  colorScheme?: NeonColorScheme;
  size?: NeonSize;
  label?: string;
}

const sizeMap: Record<NeonSize, string> = {
  sm: "16px",
  md: "22px",
  lg: "32px",
  xl: "44px",
};

export function Spinner({
  colorScheme = "pink",
  size = "md",
  label = "Loading",
}: NeonSpinnerProps) {
  const color = `var(--neon-${colorScheme})`;
  const s = sizeMap[size];
  return (
    <Box
      role="status"
      aria-label={label}
      display="inline-block"
      w={s}
      h={s}
      borderRadius="50%"
      border="2px solid"
      borderColor="rgba(255,255,255,0.08)"
      borderTopColor={color}
      boxShadow={`0 0 14px ${color}66`}
      animation="neon-spin 0.8s linear infinite"
    />
  );
}

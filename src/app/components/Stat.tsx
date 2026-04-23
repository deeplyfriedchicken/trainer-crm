"use client";

import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface NeonStatProps {
  label: ReactNode;
  value: ReactNode;
  helpText?: ReactNode;
  indicator?: "up" | "down" | null;
  accent?: "pink" | "cyan";
}

export function Stat({
  label,
  value,
  helpText,
  indicator = null,
  accent = "pink",
}: NeonStatProps) {
  const color = `var(--neon-${accent})`;
  const indicatorColor =
    indicator === "up" ? "#4ade80" : indicator === "down" ? "#ff5472" : undefined;
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4px"
      fontFamily="var(--font-neon-body), sans-serif"
    >
      <Box
        as="span"
        fontSize="11px"
        textTransform="uppercase"
        letterSpacing="0.08em"
        color="var(--neon-text-muted)"
      >
        {label}
      </Box>
      <Box
        as="span"
        fontFamily="var(--font-neon-display), sans-serif"
        fontSize="28px"
        fontWeight={800}
        color={color}
        letterSpacing="-0.02em"
        lineHeight="1"
      >
        {value}
      </Box>
      {helpText && (
        <Box
          as="span"
          fontSize="11px"
          display="inline-flex"
          alignItems="center"
          gap="4px"
          color={indicatorColor ?? "var(--neon-text-dim)"}
        >
          {indicator === "up" && <span>▲</span>}
          {indicator === "down" && <span>▼</span>}
          {helpText}
        </Box>
      )}
    </Box>
  );
}

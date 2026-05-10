"use client";

import { Box, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { Text } from "./Text";

export interface NeonStatProps extends React.HTMLAttributes<HTMLElement> {
  label: ReactNode;
  value: ReactNode;
  helpText?: ReactNode;
  indicator?: "up" | "down" | null;
  accent?: "pink" | "cyan";
}

function StatBase({
  label,
  value,
  helpText,
  indicator = null,
  accent = "pink",
  ...rest
}: NeonStatProps) {
  const color = `var(--color-${accent})`;
  const indicatorColor =
    indicator === "up"
      ? "#4ade80"
      : indicator === "down"
        ? "#ff5472"
        : undefined;
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap="4px"
      fontFamily="var(--font-body), sans-serif"
      {...rest}
    >
      <Text variant="label" color="var(--color-text-muted)">
        {label}
      </Text>
      <Text
        variant="display-3xl"
        fontWeight={800}
        color={color}
        letterSpacing="-0.02em"
        lineHeight="1"
      >
        {value}
      </Text>
      {helpText && (
        <Text
          variant="body-xs"
          display="inline-flex"
          alignItems="center"
          gap="4px"
          color={indicatorColor ?? "var(--color-text-dim)"}
        >
          {indicator === "up" && <span>▲</span>}
          {indicator === "down" && <span>▼</span>}
          {helpText}
        </Text>
      )}
    </Box>
  );
}

export const Stat = chakra(StatBase);

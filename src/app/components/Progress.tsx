"use client";

import { Progress as ChakraProgress, chakra } from "@chakra-ui/react";
import type { NeonColorScheme } from "./Button";

// Omit defaultValue/defaultChecked — HTMLAttributes types conflict with ProgressRootProps
export interface NeonProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue" | "defaultChecked"> {
  value?: number | null;
  max?: number;
  colorScheme?: NeonColorScheme;
  showValueText?: boolean;
  label?: string;
}

function ProgressBase({
  value = 50,
  max = 100,
  colorScheme = "pink",
  showValueText = false,
  label,
  ...rest
}: NeonProgressProps) {
  const color = `var(--neon-${colorScheme})`;
  const indeterminate = value === null;
  return (
    <ChakraProgress.Root
      value={indeterminate ? null : value}
      max={max}
      w="full"
      display="flex"
      flexDirection="column"
      gap="8px"
      {...rest}
    >
      {(label || showValueText) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {label && (
            <ChakraProgress.Label
              fontSize="11px"
              color="var(--neon-text-muted)"
              textTransform="uppercase"
              letterSpacing="0.08em"
              fontFamily="var(--font-neon-body), sans-serif"
            >
              {label}
            </ChakraProgress.Label>
          )}
          {showValueText && !indeterminate && (
            <ChakraProgress.ValueText
              fontSize="11px"
              color={color}
              fontFamily="var(--font-neon-mono), monospace"
            />
          )}
        </div>
      )}
      <ChakraProgress.Track
        h="6px"
        bg="var(--neon-surface-2)"
        borderRadius="999px"
        overflow="hidden"
        position="relative"
      >
        {indeterminate ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "30%",
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              boxShadow: `0 0 14px ${color}aa`,
              animation: "neon-progress-slide 1.4s ease-in-out infinite",
            }}
          />
        ) : (
          <ChakraProgress.Range
            bg={color}
            boxShadow={`0 0 14px ${color}aa`}
            transition="width 0.3s ease"
          />
        )}
      </ChakraProgress.Track>
    </ChakraProgress.Root>
  );
}

export const Progress = chakra(ProgressBase);

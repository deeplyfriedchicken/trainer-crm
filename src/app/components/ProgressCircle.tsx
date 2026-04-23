"use client";

import { ProgressCircle as ChakraProgressCircle } from "@chakra-ui/react";
import type { NeonColorScheme, NeonSize } from "./Button";

export interface NeonProgressCircleProps {
  value?: number | null;
  max?: number;
  colorScheme?: NeonColorScheme;
  size?: NeonSize;
  showValueText?: boolean;
}

const sizeMap: Record<NeonSize, { box: string; thickness: string; font: string }> = {
  sm: { box: "40px", thickness: "3px", font: "10px" },
  md: { box: "56px", thickness: "4px", font: "12px" },
  lg: { box: "80px", thickness: "5px", font: "14px" },
  xl: { box: "120px", thickness: "6px", font: "18px" },
};

export function ProgressCircle({
  value = 50,
  max = 100,
  colorScheme = "pink",
  size = "md",
  showValueText = true,
}: NeonProgressCircleProps) {
  const color = `var(--neon-${colorScheme})`;
  const s = sizeMap[size];
  return (
    <ChakraProgressCircle.Root
      value={value === null ? null : value}
      max={max}
      size={size}
      css={{
        "--size": s.box,
        "--thickness": s.thickness,
      }}
    >
      <ChakraProgressCircle.Circle
        css={{ width: s.box, height: s.box }}
      >
        <ChakraProgressCircle.Track stroke="var(--neon-surface-2)" />
        <ChakraProgressCircle.Range
          stroke={color}
          css={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </ChakraProgressCircle.Circle>
      {showValueText && value !== null && (
        <ChakraProgressCircle.ValueText
          fontSize={s.font}
          fontWeight={700}
          color={color}
          fontFamily="var(--font-neon-mono), monospace"
        />
      )}
    </ChakraProgressCircle.Root>
  );
}

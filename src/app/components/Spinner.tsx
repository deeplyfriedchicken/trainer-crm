"use client";

import { Box, chakra } from "@chakra-ui/react";
import type { NeonColorScheme, NeonSize } from "./Button";

export interface NeonSpinnerProps extends React.HTMLAttributes<HTMLElement> {
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

function SpinnerBase({
  colorScheme = "pink",
  size = "md",
  label = "Loading",
  ...rest
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
      {...rest}
    />
  );
}

// chakra() strips "size" via PatchHtmlProps — cast back to preserve it alongside style props
export const Spinner = chakra(SpinnerBase);

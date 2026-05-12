"use client";

import { IconButton as ChakraIconButton, chakra } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { NeonColorScheme, NeonSize, NeonVariant } from "./Button";

export interface NeonIconButtonProps
  extends Omit<
    React.ComponentProps<typeof ChakraIconButton>,
    "variant" | "size" | "colorScheme" | "aria-label"
  > {
  "aria-label": string;
  colorScheme?: NeonColorScheme;
  variant?: NeonVariant;
  size?: NeonSize;
}

const sizeMap: Record<NeonSize, { box: string; fontSize: string }> = {
  sm: { box: "30px", fontSize: "14px" },
  md: { box: "38px", fontSize: "16px" },
  lg: { box: "46px", fontSize: "18px" },
  xl: { box: "54px", fontSize: "20px" },
};

function chromeFor(scheme: NeonColorScheme, variant: NeonVariant) {
  if (scheme === "neutral") {
    if (variant === "solid")
      return {
        bg: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.75)",
        _hover: { bg: "rgba(255,255,255,0.16)", color: "#fff" },
      };
    if (variant === "outline")
      return {
        bg: "transparent",
        color: "rgba(255,255,255,0.5)",
        border: "1.5px solid",
        borderColor: "rgba(255,255,255,0.18)",
        _hover: {
          bg: "rgba(255,255,255,0.07)",
          color: "rgba(255,255,255,0.8)",
        },
      };
    // ghost (default for neutral)
    return {
      bg: "transparent",
      color: "rgba(255,255,255,0.5)",
      _hover: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
    };
  }

  const color = `var(--color-${scheme})`;
  if (variant === "solid")
    return {
      bg: color,
      color: "#070712",
      boxShadow: `0 0 16px ${color}66`,
      _hover: { boxShadow: `0 0 24px ${color}cc` },
    };
  if (variant === "outline")
    return {
      bg: "transparent",
      color,
      border: "1.5px solid",
      borderColor: color,
      _hover: { bg: `${color}14`, boxShadow: `0 0 16px ${color}66` },
    };
  // ghost
  return {
    bg: "transparent",
    color,
    _hover: { bg: `${color}1a`, boxShadow: `0 0 16px ${color}44` },
  };
}

const IconButtonBase = forwardRef<HTMLButtonElement, NeonIconButtonProps>(
  function IconButton(
    { colorScheme = "pink", variant = "solid", size = "md", children, ...rest },
    ref,
  ) {
    const s = sizeMap[size];
    const chrome = chromeFor(colorScheme, variant);

    return (
      <ChakraIconButton
        ref={ref}
        minW={s.box}
        w={s.box}
        h={s.box}
        fontSize={s.fontSize}
        borderRadius="var(--radius)"
        transition="all 0.15s"
        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        {...chrome}
        {...rest}
      >
        {children}
      </ChakraIconButton>
    );
  },
);

export const IconButton = chakra(
  IconButtonBase,
) as unknown as typeof IconButtonBase;

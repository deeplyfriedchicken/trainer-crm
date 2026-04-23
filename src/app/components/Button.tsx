"use client";

import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type NeonColorScheme = "pink" | "cyan";
export type NeonVariant = "solid" | "outline" | "ghost" | "link";
export type NeonSize = "sm" | "md" | "lg" | "xl";

export interface NeonButtonProps
  extends Omit<ChakraButtonProps, "variant" | "size" | "colorScheme"> {
  colorScheme?: NeonColorScheme;
  variant?: NeonVariant;
  size?: NeonSize;
}

const sizeMap: Record<NeonSize, { h: string; px: string; fontSize: string }> = {
  sm: { h: "30px", px: "12px", fontSize: "12px" },
  md: { h: "38px", px: "16px", fontSize: "13px" },
  lg: { h: "46px", px: "22px", fontSize: "14px" },
  xl: { h: "54px", px: "28px", fontSize: "15px" },
};

function stylesFor(
  scheme: NeonColorScheme,
  variant: NeonVariant,
): ChakraButtonProps {
  const color = `var(--neon-${scheme})`;
  const colorSoft = `var(--neon-${scheme}-soft)`;
  const base: ChakraButtonProps = {
    fontFamily: "var(--font-neon-body), sans-serif",
    fontWeight: 600,
    letterSpacing: "0.01em",
    borderRadius: "var(--neon-radius)",
    transition: "all 0.15s",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: color,
      outlineOffset: "2px",
    },
    _disabled: { opacity: 0.4, cursor: "not-allowed", boxShadow: "none" },
  };

  if (variant === "solid") {
    return {
      ...base,
      bg: color,
      color: "#070712",
      boxShadow: `0 0 18px ${color}66`,
      _hover: { bg: colorSoft, boxShadow: `0 0 28px ${color}cc`, transform: "translateY(-1px)" },
      _active: { transform: "translateY(0)" },
    };
  }
  if (variant === "outline") {
    return {
      ...base,
      bg: "transparent",
      color,
      border: "1.5px solid",
      borderColor: color,
      boxShadow: `inset 0 0 0 0 ${color}, 0 0 12px ${color}33`,
      _hover: {
        bg: `${color}14`,
        boxShadow: `inset 0 0 0 1px ${color}, 0 0 20px ${color}66`,
      },
    };
  }
  if (variant === "ghost") {
    return {
      ...base,
      bg: "transparent",
      color,
      _hover: { bg: `${color}1a`, boxShadow: `0 0 16px ${color}44` },
    };
  }
  // link
  return {
    ...base,
    bg: "transparent",
    color,
    px: 0,
    h: "auto",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    _hover: { color: colorSoft, textShadow: `0 0 10px ${color}` },
  };
}

export const Button = forwardRef<HTMLButtonElement, NeonButtonProps>(
  function Button(
    {
      colorScheme = "pink",
      variant = "solid",
      size = "md",
      children,
      ...rest
    },
    ref,
  ) {
    const s = sizeMap[size];
    const styles = stylesFor(colorScheme, variant);
    return (
      <ChakraButton
        ref={ref}
        h={variant === "link" ? undefined : s.h}
        px={variant === "link" ? undefined : s.px}
        fontSize={s.fontSize}
        {...styles}
        {...rest}
      >
        {children}
      </ChakraButton>
    );
  },
);

"use client";

import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
  chakra,
} from "@chakra-ui/react";
import { forwardRef } from "react";

export type NeonColorScheme = "pink" | "cyan" | "red" | "neutral";
export type NeonVariant = "solid" | "outline" | "ghost" | "link" | "dashed";
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

const base: ChakraButtonProps = {
  fontFamily: "var(--font-body), sans-serif",
  fontWeight: 600,
  letterSpacing: "0.01em",
  borderRadius: "var(--radius)",
  transition: "all 0.15s",
  _disabled: { opacity: 0.4, cursor: "not-allowed", boxShadow: "none" },
};

function neutralStyles(variant: NeonVariant): ChakraButtonProps {
  const b = {
    ...base,
    _focusVisible: {
      outline: "2px solid rgba(255,255,255,0.4)",
      outlineOffset: "2px",
    },
  };
  if (variant === "solid") {
    return {
      ...b,
      bg: "rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.75)",
      _hover: { bg: "rgba(255,255,255,0.15)", color: "#fff" },
      _active: { transform: "translateY(0)" },
    };
  }
  if (variant === "outline") {
    return {
      ...b,
      bg: "transparent",
      color: "rgba(255,255,255,0.55)",
      border: "1.5px solid",
      borderColor: "rgba(255,255,255,0.18)",
      _hover: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)" },
    };
  }
  if (variant === "ghost") {
    return {
      ...b,
      bg: "transparent",
      color: "rgba(255,255,255,0.5)",
      _hover: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" },
    };
  }
  if (variant === "dashed") {
    return {
      ...b,
      bg: "transparent",
      color: "rgba(255,255,255,0.5)",
      border: "1.5px dashed",
      borderColor: "rgba(255,255,255,0.18)",
      _hover: {
        borderColor: "rgba(255,255,255,0.35)",
        color: "rgba(255,255,255,0.8)",
      },
    };
  }
  // link
  return {
    ...b,
    bg: "transparent",
    color: "rgba(255,255,255,0.55)",
    px: 0,
    h: "auto",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    _hover: { color: "rgba(255,255,255,0.85)" },
  };
}

function stylesFor(
  scheme: NeonColorScheme,
  variant: NeonVariant,
): ChakraButtonProps {
  if (scheme === "neutral") return neutralStyles(variant);

  const color = `var(--color-${scheme})`;
  const colorSoft = `var(--color-${scheme}-soft)`;

  const b: ChakraButtonProps = {
    ...base,
    _focusVisible: {
      outline: "2px solid",
      outlineColor: color,
      outlineOffset: "2px",
    },
  };

  if (variant === "solid") {
    return {
      ...b,
      bg: color,
      color: "#070712",
      boxShadow: `0 0 18px ${color}66`,
      _hover: {
        bg: colorSoft,
        boxShadow: `0 0 28px ${color}cc`,
        transform: "translateY(-1px)",
      },
      _active: { transform: "translateY(0)" },
    };
  }
  if (variant === "outline") {
    return {
      ...b,
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
      ...b,
      bg: "transparent",
      color,
      _hover: { bg: `${color}1a`, boxShadow: `0 0 16px ${color}44` },
    };
  }
  if (variant === "dashed") {
    return {
      ...b,
      bg: "transparent",
      color,
      border: "1.5px dashed",
      borderColor: `${color}4d`,
      _hover: { borderColor: `${color}99`, color: colorSoft },
    };
  }
  // link
  return {
    ...b,
    bg: "transparent",
    color,
    px: 0,
    h: "auto",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    _hover: { color: colorSoft, textShadow: `0 0 10px ${color}` },
  };
}

const ButtonBase = forwardRef<HTMLButtonElement, NeonButtonProps>(
  function Button(
    { colorScheme = "pink", variant = "solid", size = "md", children, ...rest },
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

// chakra() strips "size" via PatchHtmlProps — cast back to restore it
export const Button = chakra(ButtonBase) as unknown as typeof ButtonBase;

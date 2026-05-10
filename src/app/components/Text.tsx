"use client";

import { Box, type BoxProps, chakra } from "@chakra-ui/react";
import { forwardRef } from "react";

export type TextVariant =
  | "display-7xl"
  | "display-6xl"
  | "display-5xl"
  | "display-4xl"
  | "display-3xl"
  | "display-2xl"
  | "display-xl"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "body-xs"
  | "body-3xs"
  | "label"
  | "mono-lg"
  | "mono-md"
  | "mono-sm";

type StyleDef = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  letterSpacing?: string;
};

const VARIANT_STYLES: Record<TextVariant, StyleDef> = {
  "display-7xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "72px",
    fontWeight: 800,
    lineHeight: "1",
  },
  "display-6xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "56px",
    fontWeight: 800,
    lineHeight: "1.05",
  },
  "display-5xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "40px",
    fontWeight: 700,
    lineHeight: "1.1",
  },
  "display-4xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: "1.15",
  },
  "display-3xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "1.2",
  },
  "display-2xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "1.3",
  },
  "display-xl": {
    fontFamily: "var(--font-display), sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: "1.3",
  },
  "body-lg": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-md": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-sm": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-xs": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-3xs": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "10px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "label": {
    fontFamily: "var(--font-body), sans-serif",
    fontSize: "11px",
    fontWeight: 600,
    lineHeight: "1.5",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  "mono-lg": {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "mono-md": {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "mono-sm": {
    fontFamily: "var(--font-mono), monospace",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
};

export interface TextProps extends Omit<BoxProps, "variant"> {
  variant?: TextVariant;
}

const TextBase = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = "body-md", ...rest },
  ref,
) {
  return <Box ref={ref} as="span" {...VARIANT_STYLES[variant]} {...rest} />;
});

// chakra() strips "variant" via PatchHtmlProps — cast back to restore it
export const Text = chakra(TextBase) as unknown as typeof TextBase;


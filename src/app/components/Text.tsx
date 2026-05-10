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
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "body-xs"
  | "mono-lg"
  | "mono-md"
  | "mono-sm";

type StyleDef = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
};

const VARIANT_STYLES: Record<TextVariant, StyleDef> = {
  "display-7xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "72px",
    fontWeight: 800,
    lineHeight: "1",
  },
  "display-6xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "56px",
    fontWeight: 800,
    lineHeight: "1.05",
  },
  "display-5xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "40px",
    fontWeight: 700,
    lineHeight: "1.1",
  },
  "display-4xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "32px",
    fontWeight: 700,
    lineHeight: "1.15",
  },
  "display-3xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "24px",
    fontWeight: 700,
    lineHeight: "1.2",
  },
  "display-2xl": {
    fontFamily: "var(--font-neon-display), sans-serif",
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: "1.3",
  },
  "body-lg": {
    fontFamily: "var(--font-neon-body), sans-serif",
    fontSize: "18px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-md": {
    fontFamily: "var(--font-neon-body), sans-serif",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-sm": {
    fontFamily: "var(--font-neon-body), sans-serif",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "body-xs": {
    fontFamily: "var(--font-neon-body), sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "mono-lg": {
    fontFamily: "var(--font-neon-mono), monospace",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "mono-md": {
    fontFamily: "var(--font-neon-mono), monospace",
    fontSize: "14px",
    fontWeight: 400,
    lineHeight: "1.5",
  },
  "mono-sm": {
    fontFamily: "var(--font-neon-mono), monospace",
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

/*
 * PROPOSED VARIANTS — patterns found in the codebase that still require
 * hardcoded font props because no variant covers them:
 *
 * "display-xl"   — display font · 16px · w700 · lh1.3
 *                  Used for: card names (TrainerCard), minor UI headings.
 *                  Would close the gap between body-lg (18px body) and display-2xl (20px display).
 *
 * "display-3xl"  — current variant is w700; a w800 sibling is needed.
 *                  Affected: SectionTitle (28px/w800), PageHeader title (26px/w800),
 *                  Stat value (28px/w800), TrainerCard stat (22px/w800).
 *                  All use display font at w800 in the 20–32px range with no matching variant.
 *
 * "body-2xs"     — body font · 11px · w400 · lh1.5
 *                  Used for: Stat label, TrainerCard stat label, Sidebar version text,
 *                  ProfileStatStrip label. Smaller than body-xs (12px) but still body font.
 *
 * "body-3xs"     — body font · 10px · w400 · lh1.5
 *                  Used for: ProfileStatStrip label, Sidebar nav group labels.
 *
 * "label"        — body font · 11px · w600 · uppercase · letterSpacing 0.08em · lh1.5
 *                  Used for: Stat label, table th headers, overline-style section labels.
 *                  A semantic variant (not just a size) that bundles the uppercase+tracking
 *                  pattern so callers don't repeat textTransform + letterSpacing.
 *
 * "mono-xs"      — mono font · 11px · w400 · lh1.5
 *                  Used for: ColorPalette swatch labels, token value column.
 *                  Smaller than mono-sm (12px) needed for dense data display.
 */

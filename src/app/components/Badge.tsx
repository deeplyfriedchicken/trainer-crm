"use client";

import { Badge as ChakraBadge, type BadgeProps, chakra } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { NeonColorScheme } from "./Button";

export type NeonBadgeVariant = "solid" | "subtle" | "outline";

export interface NeonBadgeProps
  extends Omit<BadgeProps, "variant" | "colorScheme" | "size"> {
  colorScheme?: NeonColorScheme;
  variant?: NeonBadgeVariant;
}

const BadgeBase = forwardRef<HTMLSpanElement, NeonBadgeProps>(
  function Badge(
    { colorScheme = "pink", variant = "subtle", children, ...rest },
    ref,
  ) {
    const color = `var(--neon-${colorScheme})`;
    const chrome =
      variant === "solid"
        ? {
            bg: color,
            color: "#070712",
            boxShadow: `0 0 10px ${color}66`,
            borderColor: "transparent",
          }
        : variant === "outline"
          ? {
              bg: "transparent",
              color,
              border: "1px solid",
              borderColor: color,
            }
          : {
              bg: `${color}1a`,
              color,
              border: "1px solid",
              borderColor: `${color}55`,
            };
    return (
      <ChakraBadge
        ref={ref}
        display="inline-flex"
        alignItems="center"
        gap="6px"
        px="10px"
        py="3px"
        fontSize="11px"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.06em"
        fontFamily="var(--font-neon-mono), monospace"
        borderRadius="999px"
        {...chrome}
        {...rest}
      >
        {children}
      </ChakraBadge>
    );
  },
);

export const Badge = chakra(BadgeBase);

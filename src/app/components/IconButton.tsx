"use client";

import { IconButton as ChakraIconButton } from "@chakra-ui/react";
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

export const IconButton = forwardRef<HTMLButtonElement, NeonIconButtonProps>(
  function IconButton(
    { colorScheme = "pink", variant = "solid", size = "md", children, ...rest },
    ref,
  ) {
    const color = `var(--neon-${colorScheme})`;
    const s = sizeMap[size];
    const chrome =
      variant === "solid"
        ? {
            bg: color,
            color: "#070712",
            boxShadow: `0 0 16px ${color}66`,
            _hover: { boxShadow: `0 0 24px ${color}cc` },
          }
        : variant === "outline"
          ? {
              bg: "transparent",
              color,
              border: "1.5px solid",
              borderColor: color,
              _hover: { bg: `${color}14`, boxShadow: `0 0 16px ${color}66` },
            }
          : {
              bg: "transparent",
              color,
              _hover: { bg: `${color}1a` },
            };

    return (
      <ChakraIconButton
        ref={ref}
        minW={s.box}
        w={s.box}
        h={s.box}
        fontSize={s.fontSize}
        borderRadius="var(--neon-radius)"
        transition="all 0.15s"
        {...chrome}
        {...rest}
      >
        {children}
      </ChakraIconButton>
    );
  },
);

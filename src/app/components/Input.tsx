"use client";

import {
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
  chakra,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import type { NeonColorScheme, NeonSize } from "./Button";

export interface NeonInputProps extends Omit<ChakraInputProps, "size"> {
  colorScheme?: NeonColorScheme;
  size?: Exclude<NeonSize, "xl">;
  invalid?: boolean;
}

const sizeMap: Record<
  Exclude<NeonSize, "xl">,
  { h: string; fontSize: string; px: string }
> = {
  sm: { h: "30px", fontSize: "12px", px: "10px" },
  md: { h: "38px", fontSize: "13px", px: "12px" },
  lg: { h: "46px", fontSize: "14px", px: "14px" },
};

const InputBase = forwardRef<HTMLInputElement, NeonInputProps>(function Input(
  { colorScheme = "pink", size = "md", invalid = false, ...rest },
  ref,
) {
  const color = `var(--neon-${colorScheme})`;
  const s = sizeMap[size];
  return (
    <ChakraInput
      ref={ref}
      h={s.h}
      px={s.px}
      fontSize={s.fontSize}
      fontFamily="var(--font-neon-body), sans-serif"
      bg="var(--neon-surface-2)"
      color="var(--neon-text)"
      border="1px solid"
      borderColor={invalid ? "#ff5472" : "var(--neon-border-strong)"}
      borderRadius="var(--neon-radius)"
      transition="all 0.15s"
      _placeholder={{ color: "var(--neon-text-dim)" }}
      _hover={{ borderColor: invalid ? "#ff5472" : `${color}66` }}
      _focus={{
        borderColor: color,
        boxShadow: `0 0 0 3px ${color}33`,
        outline: "none",
      }}
      _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
      {...rest}
    />
  );
});

export const Input = chakra(InputBase) as unknown as typeof InputBase;

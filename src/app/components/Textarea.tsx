"use client";

import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
  chakra,
} from "@chakra-ui/react";
import { forwardRef } from "react";
import type { NeonColorScheme } from "./Button";

export interface NeonTextareaProps extends ChakraTextareaProps {
  colorScheme?: NeonColorScheme;
  invalid?: boolean;
}

const TextareaBase = forwardRef<HTMLTextAreaElement, NeonTextareaProps>(
  function Textarea({ colorScheme = "pink", invalid = false, ...rest }, ref) {
    const color = `var(--neon-${colorScheme})`;
    return (
      <ChakraTextarea
        ref={ref}
        px="12px"
        py="10px"
        fontSize="13px"
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
        {...rest}
      />
    );
  },
);

export const Textarea = chakra(TextareaBase);

"use client";

import { Switch as ChakraSwitch } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import type { NeonColorScheme } from "./Button";

export interface NeonSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  colorScheme?: NeonColorScheme;
  children?: ReactNode;
}

export const Switch = forwardRef<HTMLLabelElement, NeonSwitchProps>(
  function Switch(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      name,
      colorScheme = "pink",
      children,
    },
    ref,
  ) {
    const color = `var(--neon-${colorScheme})`;
    return (
      <ChakraSwitch.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(d) => onCheckedChange?.(d.checked === true)}
        disabled={disabled}
        name={name}
        gap="10px"
        cursor={disabled ? "not-allowed" : "pointer"}
      >
        <ChakraSwitch.HiddenInput />
        <ChakraSwitch.Control
          w="36px"
          h="20px"
          p="2px"
          borderRadius="999px"
          bg="var(--neon-surface-2)"
          border="1px solid var(--neon-border-strong)"
          transition="all 0.15s"
          _checked={{
            bg: color,
            borderColor: color,
            boxShadow: `0 0 14px ${color}88`,
          }}
        >
          <ChakraSwitch.Thumb
            w="14px"
            h="14px"
            borderRadius="50%"
            bg="#fff"
            boxShadow="0 1px 3px rgba(0,0,0,0.4)"
            transition="transform 0.2s"
          />
        </ChakraSwitch.Control>
        {children && (
          <ChakraSwitch.Label
            fontSize="13px"
            fontFamily="var(--font-neon-body), sans-serif"
            color="var(--neon-text)"
          >
            {children}
          </ChakraSwitch.Label>
        )}
      </ChakraSwitch.Root>
    );
  },
);

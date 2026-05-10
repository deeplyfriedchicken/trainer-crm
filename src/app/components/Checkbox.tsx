"use client";

import { Checkbox as ChakraCheckbox, chakra } from "@chakra-ui/react";
import { forwardRef, type ReactNode } from "react";
import type { NeonColorScheme } from "./Button";

export interface NeonCheckboxProps extends React.HTMLAttributes<HTMLElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  colorScheme?: NeonColorScheme;
  children?: ReactNode;
}

const CheckboxBase = forwardRef<HTMLLabelElement, NeonCheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      onCheckedChange,
      disabled,
      name,
      value,
      colorScheme = "pink",
      children,
      ...rest
    },
    ref,
  ) {
    const color = `var(--color-${colorScheme})`;
    return (
      <ChakraCheckbox.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(d) => onCheckedChange?.(d.checked === true)}
        disabled={disabled}
        name={name}
        value={value}
        gap="10px"
        cursor={disabled ? "not-allowed" : "pointer"}
        {...rest}
      >
        <ChakraCheckbox.HiddenInput />
        <ChakraCheckbox.Control
          w="18px"
          h="18px"
          minW="18px"
          borderRadius="5px"
          bg="var(--color-surface-2)"
          border="1.5px solid var(--color-border-strong)"
          transition="all 0.15s"
          _checked={{
            bg: color,
            borderColor: color,
            boxShadow: `0 0 12px ${color}88`,
          }}
          _hover={{ borderColor: `${color}aa` }}
        >
          <ChakraCheckbox.Indicator color="#070712" />
        </ChakraCheckbox.Control>
        {children && (
          <ChakraCheckbox.Label
            fontSize="13px"
            fontFamily="var(--font-body), sans-serif"
            color="var(--color-text)"
          >
            {children}
          </ChakraCheckbox.Label>
        )}
      </ChakraCheckbox.Root>
    );
  },
);

export const Checkbox = chakra(CheckboxBase);

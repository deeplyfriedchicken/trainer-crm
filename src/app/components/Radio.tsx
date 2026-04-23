"use client";

import { RadioGroup } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { NeonColorScheme } from "./Button";

export interface NeonRadioOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface NeonRadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: NeonRadioOption[];
  name?: string;
  orientation?: "horizontal" | "vertical";
  colorScheme?: NeonColorScheme;
}

export function Radio({
  value,
  defaultValue,
  onValueChange,
  options,
  name,
  orientation = "vertical",
  colorScheme = "pink",
}: NeonRadioGroupProps) {
  const color = `var(--neon-${colorScheme})`;
  return (
    <RadioGroup.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(d) => d.value && onValueChange?.(d.value)}
      name={name}
      orientation={orientation}
      display="flex"
      flexDirection={orientation === "vertical" ? "column" : "row"}
      gap={orientation === "vertical" ? "10px" : "18px"}
    >
      {options.map((opt) => (
        <RadioGroup.Item
          key={opt.value}
          value={opt.value}
          disabled={opt.disabled}
          gap="10px"
          cursor={opt.disabled ? "not-allowed" : "pointer"}
        >
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemControl
            w="18px"
            h="18px"
            minW="18px"
            borderRadius="50%"
            bg="var(--neon-surface-2)"
            border="1.5px solid var(--neon-border-strong)"
            transition="all 0.15s"
            _checked={{
              borderColor: color,
              boxShadow: `0 0 12px ${color}88`,
            }}
            _hover={{ borderColor: `${color}aa` }}
          >
            <RadioGroup.ItemIndicator
              bg={color}
              w="8px"
              h="8px"
              borderRadius="50%"
            />
          </RadioGroup.ItemControl>
          <RadioGroup.ItemText
            fontSize="13px"
            fontFamily="var(--font-neon-body), sans-serif"
            color="var(--neon-text)"
          >
            {opt.label}
          </RadioGroup.ItemText>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}

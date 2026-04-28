"use client";

import { chakra, NativeSelect } from "@chakra-ui/react";
import { forwardRef } from "react";
import type { NeonColorScheme, NeonSize } from "./Button";

export interface NeonSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NeonSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: NeonSelectOption[];
  placeholder?: string;
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

const SelectBase = forwardRef<HTMLSelectElement, NeonSelectProps>(
  function Select(
    {
      options,
      placeholder,
      colorScheme = "pink",
      size = "md",
      invalid = false,
      className,
      style,
      ...rest
    },
    ref,
  ) {
    const color = `var(--neon-${colorScheme})`;
    const s = sizeMap[size];
    return (
      <NativeSelect.Root
        size={size}
        borderRadius="var(--neon-radius)"
        w="full"
        className={className}
        style={style}
      >
        <NativeSelect.Field
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
          _hover={{ borderColor: `${color}66` }}
          _focus={{
            borderColor: color,
            boxShadow: `0 0 0 3px ${color}33`,
            outline: "none",
          }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator color={color} />
      </NativeSelect.Root>
    );
  },
);

export const Select = chakra(SelectBase);

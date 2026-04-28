"use client";

import { Field as ChakraField, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface NeonFieldProps extends React.HTMLAttributes<HTMLElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  required?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function FieldBase({
  label,
  helperText,
  errorText,
  required,
  invalid,
  disabled,
  children,
  ...rest
}: NeonFieldProps) {
  return (
    <ChakraField.Root
      required={required}
      invalid={invalid}
      disabled={disabled}
      gap="6px"
      display="flex"
      flexDirection="column"
      {...rest}
    >
      {label && (
        <ChakraField.Label
          fontSize="11px"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing="0.08em"
          color="var(--neon-text-muted)"
          fontFamily="var(--font-neon-body), sans-serif"
        >
          {label}
          {required && (
            <ChakraField.RequiredIndicator color="var(--neon-pink)" ml="2px" />
          )}
        </ChakraField.Label>
      )}
      {children}
      {helperText && !invalid && (
        <ChakraField.HelperText
          fontSize="11px"
          color="var(--neon-text-dim)"
          fontFamily="var(--font-neon-body), sans-serif"
        >
          {helperText}
        </ChakraField.HelperText>
      )}
      {invalid && errorText && (
        <ChakraField.ErrorText
          fontSize="11px"
          color="#ff5472"
          fontFamily="var(--font-neon-body), sans-serif"
        >
          {errorText}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
}

export const Field = chakra(FieldBase);

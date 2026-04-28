"use client";

import { Box, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { NeonColorScheme } from "./Button";

export interface NeonTagProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  colorScheme?: NeonColorScheme;
  onRemove?: () => void;
}

function TagBase({ children, colorScheme = "pink", onRemove, ...rest }: NeonTagProps) {
  const color = `var(--neon-${colorScheme})`;
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      gap="6px"
      px="10px"
      py="4px"
      bg={`${color}14`}
      border="1px solid"
      borderColor={`${color}55`}
      borderRadius="8px"
      color={color}
      fontSize="12px"
      fontWeight={600}
      fontFamily="var(--font-neon-body), sans-serif"
      {...rest}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            cursor: "pointer",
            fontSize: "14px",
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </Box>
  );
}

export const Tag = chakra(TagBase);

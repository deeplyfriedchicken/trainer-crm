"use client";

import { Box, chakra } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { NeonColorScheme } from "./Button";
import { IconButton } from "./IconButton";

export interface NeonTagProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  colorScheme?: NeonColorScheme;
  onRemove?: () => void;
}

function TagBase({
  children,
  colorScheme = "pink",
  onRemove,
  ...rest
}: NeonTagProps) {
  const color = `var(--color-${colorScheme})`;
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
      fontFamily="var(--font-body), sans-serif"
      {...rest}
    >
      {children}
      {onRemove && (
        <IconButton
          variant="ghost"
          colorScheme="neutral"
          size="sm"
          onClick={onRemove}
          aria-label="Remove"
          minW="16px"
          w="16px"
          h="16px"
          fontSize="12px"
          borderRadius="4px"
        >
          ×
        </IconButton>
      )}
    </Box>
  );
}

export const Tag = chakra(TagBase);

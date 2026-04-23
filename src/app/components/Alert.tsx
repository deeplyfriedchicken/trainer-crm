"use client";

import { Alert as ChakraAlert, type AlertRootProps } from "@chakra-ui/react";
import type { ReactNode } from "react";

export type NeonAlertStatus = "info" | "success" | "warning" | "error";

export interface NeonAlertProps extends Omit<AlertRootProps, "status" | "title"> {
  status?: NeonAlertStatus;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
}

const palette: Record<NeonAlertStatus, { color: string; soft: string }> = {
  info: { color: "var(--neon-cyan)", soft: "rgba(52, 253, 254, 0.08)" },
  success: { color: "#4ade80", soft: "rgba(74, 222, 128, 0.08)" },
  warning: { color: "#fbbf24", soft: "rgba(251, 191, 36, 0.08)" },
  error: { color: "#ff5472", soft: "rgba(255, 84, 114, 0.08)" },
};

const iconMap: Record<NeonAlertStatus, string> = {
  info: "i",
  success: "✓",
  warning: "!",
  error: "×",
};

export function Alert({
  status = "info",
  title,
  children,
  icon,
  ...rest
}: NeonAlertProps) {
  const p = palette[status];
  return (
    <ChakraAlert.Root
      display="flex"
      alignItems="flex-start"
      gap="12px"
      p="14px 16px"
      bg={p.soft}
      border="1px solid"
      borderColor={`${p.color}55`}
      borderRadius="var(--neon-radius)"
      color="var(--neon-text)"
      {...rest}
    >
      <ChakraAlert.Indicator
        w="22px"
        h="22px"
        minW="22px"
        borderRadius="50%"
        bg={p.color}
        color="#070712"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="13px"
        fontWeight={700}
        boxShadow={`0 0 12px ${p.color}88`}
      >
        {icon ?? iconMap[status]}
      </ChakraAlert.Indicator>
      <ChakraAlert.Content flex="1" display="flex" flexDirection="column" gap="3px">
        {title && (
          <ChakraAlert.Title
            fontSize="13px"
            fontWeight={700}
            color="var(--neon-text)"
            fontFamily="var(--font-neon-body), sans-serif"
          >
            {title}
          </ChakraAlert.Title>
        )}
        {children && (
          <ChakraAlert.Description
            fontSize="12px"
            color="var(--neon-text-muted)"
            fontFamily="var(--font-neon-body), sans-serif"
            lineHeight="1.5"
          >
            {children}
          </ChakraAlert.Description>
        )}
      </ChakraAlert.Content>
    </ChakraAlert.Root>
  );
}

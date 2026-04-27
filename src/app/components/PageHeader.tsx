import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex
      justify={{ base: "flex-start", md: "space-between" }}
      align={{ base: "flex-start", md: "flex-end" }}
      flexDirection={{ base: "column", md: "row" }}
      gap={{ base: "12px", md: "0" }}
      mb="28px"
    >
      <Box>
        <Box
          fontFamily="var(--font-neon-display), sans-serif"
          fontSize="26px"
          fontWeight={800}
          letterSpacing="-0.02em"
          color="var(--neon-text)"
          lineHeight="1.1"
        >
          {title}
        </Box>
        {subtitle && (
          <Box fontSize="13px" color="var(--neon-text-dim)" mt="4px">
            {subtitle}
          </Box>
        )}
      </Box>
      {action && (
        <Box flexShrink={0} w={{ base: "100%", md: "auto" }}>
          {action}
        </Box>
      )}
    </Flex>
  );
}

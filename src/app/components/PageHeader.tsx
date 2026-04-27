import { Box, Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-end" mb="28px">
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
      {action && <Box flexShrink={0}>{action}</Box>}
    </Flex>
  );
}

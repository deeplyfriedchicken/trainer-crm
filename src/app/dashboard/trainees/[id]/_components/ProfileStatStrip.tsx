import { Box, Flex } from "@chakra-ui/react";

export type StatEntry = { label: string; value: string; color?: string };

export function ProfileStatStrip({ stats }: { stats: StatEntry[] }) {
  return (
    <Flex
      flexShrink={0}
      borderRadius="12px"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.08)"
      ml="auto"
    >
      {stats.map((s, i) => (
        <Box
          key={s.label}
          px="18px"
          py="14px"
          textAlign="center"
          bg="rgba(255,255,255,0.03)"
          borderRight={i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : undefined}
        >
          <Box
            fontFamily="var(--font-neon-display), sans-serif"
            fontSize="20px"
            fontWeight={800}
            lineHeight="1"
            mb="4px"
            color={s.color ?? "rgba(255,255,255,0.6)"}
          >
            {s.value}
          </Box>
          <Box
            fontSize="10px"
            color="rgba(255,255,255,0.35)"
            textTransform="uppercase"
            letterSpacing="0.1em"
          >
            {s.label}
          </Box>
        </Box>
      ))}
    </Flex>
  );
}

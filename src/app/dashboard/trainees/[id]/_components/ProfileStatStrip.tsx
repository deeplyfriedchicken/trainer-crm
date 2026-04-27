import { Box, Flex } from "@chakra-ui/react";

export type StatEntry = { label: string; value: string; color?: string };

export function ProfileStatStrip({ stats }: { stats: StatEntry[] }) {
  return (
    <Flex
      flexShrink={{ base: 1, md: 0 }}
      w={{ base: "100%", md: "auto" }}
      borderRadius="12px"
      overflow="hidden"
      border="1px solid rgba(255,255,255,0.08)"
      ml={{ base: 0, md: "auto" }}
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

import { Box, Flex } from "@chakra-ui/react";

type TrainerCardProps = {
  name: string;
  email: string;
  color: string;
  initial: string;
  activeTraineeCount: number;
  videoCount: number;
};

export function TrainerCard({
  name,
  email,
  color,
  initial,
  activeTraineeCount,
  videoCount,
}: TrainerCardProps) {
  return (
    <Box
      bg="var(--neon-surface)"
      border="1px solid var(--neon-border)"
      borderRadius="16px"
      p="24px 20px"
      textAlign="center"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        borderColor: "rgba(52,253,254,0.3)",
        transform: "translateY(-3px)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.4), 0 0 24px rgba(52,253,254,0.07)",
      }}
    >
      {/* Avatar */}
      <Box
        w="72px"
        h="72px"
        borderRadius="50%"
        mx="auto"
        mb="14px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontFamily="var(--font-neon-display), sans-serif"
        fontSize="26px"
        fontWeight={800}
        position="relative"
        bg={`${color}18`}
        border={`2px solid ${color}55`}
        color={color}
      >
        {initial}
        <Box
          position="absolute"
          bottom="2px"
          right="2px"
          w="14px"
          h="14px"
          borderRadius="50%"
          bg="#4ade80"
          border="2px solid var(--neon-bg)"
        />
      </Box>

      {/* Name / email */}
      <Box
        fontFamily="var(--font-neon-display), sans-serif"
        fontSize="16px"
        fontWeight={700}
        color="var(--neon-text)"
        mb="4px"
      >
        {name}
      </Box>
      <Box fontSize="12px" color="var(--neon-text-dim)" mb="16px">
        {email}
      </Box>

      {/* Stats */}
      <Flex justify="center" gap="24px" mb="20px">
        {[
          { label: "Clients", value: activeTraineeCount },
          { label: "Videos", value: videoCount },
        ].map(({ label, value }) => (
          <Box key={label} textAlign="center">
            <Box
              fontFamily="var(--font-neon-display), sans-serif"
              fontSize="22px"
              fontWeight={800}
              color={color}
            >
              {value}
            </Box>
            <Box fontSize="11px" color="var(--neon-text-dim)">
              {label}
            </Box>
          </Box>
        ))}
      </Flex>

      {/* Action */}
      <Box
        as="button"
        w="full"
        py="7px"
        borderRadius="10px"
        border={`1px solid ${color}55`}
        color={color}
        bg="transparent"
        fontSize="12px"
        fontFamily="var(--font-neon-body), sans-serif"
        fontWeight={600}
        cursor="pointer"
        transition="all 0.15s"
        _hover={{ bg: `${color}14` }}
      >
        View Profile
      </Box>
    </Box>
  );
}

import { Box, Flex } from "@chakra-ui/react";
import { Badge } from "@/app/components/Badge";
import { Text } from "@/app/components/Text";

const ROLE_LABEL: Record<string, string> = {
  trainer: "Trainer",
  trainer_manager: "Trainer Manager",
  admin: "Admin",
  trainee: "Trainee",
};

type TrainerCardProps = {
  name: string;
  email: string;
  color: string;
  initial: string;
  videoCount: number;
  roles: string[];
};

export function TrainerCard({
  name,
  email,
  color,
  initial,
  videoCount,
  roles,
}: TrainerCardProps) {
  return (
    <Box
      bg="var(--color-surface)"
      border="1px solid var(--color-border)"
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
        fontFamily="var(--font-display), sans-serif"
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
          border="2px solid var(--color-bg)"
        />
      </Box>

      {/* Name / email */}
      <Text
        variant="display-xl"
        color="var(--color-text)"
        mb="4px"
        display="block"
      >
        {name}
      </Text>
      <Text variant="body-xs" color="var(--color-text-dim)" mb="10px" display="block">
        {email}
      </Text>

      {/* Roles */}
      <Flex justify="center" gap="6px" flexWrap="wrap" mb="16px">
        {roles.map((role) => (
          <Badge
            key={role}
            colorScheme={role === "trainer_manager" ? "cyan" : "pink"}
            variant="subtle"
          >
            {ROLE_LABEL[role] ?? role}
          </Badge>
        ))}
      </Flex>

      {/* Stats */}
      <Flex justify="center" gap="24px" mb="20px">
        {[{ label: "Videos", value: videoCount }].map(({ label, value }) => (
          <Box key={label} textAlign="center">
            <Text
              variant="display-3xl"
              fontWeight={800}
              fontSize="22px"
              color={color}
              display="block"
            >
              {value}
            </Text>
            <Text variant="body-xs" color="var(--color-text-dim)" display="block">
              {label}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Action */}
      <Text
        variant="body-xs"
        as="button"
        w="full"
        py="7px"
        borderRadius="10px"
        border={`1px solid ${color}55`}
        color={color}
        bg="transparent"
        fontWeight={600}
        cursor="pointer"
        transition="all 0.15s"
        _hover={{ bg: `${color}14` }}
      >
        View Profile
      </Text>
    </Box>
  );
}

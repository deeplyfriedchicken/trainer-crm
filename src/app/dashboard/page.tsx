import { Box } from "@chakra-ui/react";

export default function DashboardHome() {
  return (
    <Box
      p="32px"
      minH="calc(100vh - var(--crm-topbar-h))"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="var(--neon-text-dim)"
      fontSize="14px"
    >
      Dashboard content goes here.
    </Box>
  );
}

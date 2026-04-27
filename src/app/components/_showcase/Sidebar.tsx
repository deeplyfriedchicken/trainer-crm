"use client";

import { Box } from "@chakra-ui/react";

interface NavItem {
  id: string;
  label: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Foundation",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
    ],
  },
  {
    title: "Components",
    items: [
      { id: "buttons", label: "Buttons" },
      { id: "forms", label: "Form Elements" },
      { id: "feedback", label: "Feedback" },
      { id: "cards", label: "Cards & Layout" },
      { id: "tables", label: "Table" },
      { id: "sessions-panel", label: "Sessions Panel" },
      { id: "chat-panel", label: "Chat Panel" },
      { id: "dialog", label: "Dialog" },
      { id: "page-header", label: "Page Header" },
    ],
  },
];

export function Sidebar() {
  return (
    <Box
      as="nav"
      aria-label="Component navigation"
      w="240px"
      minW="240px"
      minH="100vh"
      position="sticky"
      top="0"
      alignSelf="flex-start"
      h="100vh"
      overflowY="auto"
      bg="rgba(10,10,22,0.9)"
      borderRight="1px solid var(--neon-border)"
      backdropFilter="blur(20px)"
      zIndex={100}
      display="flex"
      flexDirection="column"
      pt="28px"
      pb="40px"
      css={{
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-track": { background: "transparent" },
        "&::-webkit-scrollbar-thumb": {
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
        },
      }}
    >
      <Box
        px="24px"
        pb="24px"
        borderBottom="1px solid var(--neon-border)"
        mb="16px"
      >
        <Box display="flex" alignItems="center" gap="6px" mb="6px">
          <Box
            w="10px"
            h="10px"
            borderRadius="50%"
            bg="var(--neon-pink)"
            boxShadow="0 0 10px var(--neon-pink)"
          />
          <Box
            w="10px"
            h="10px"
            borderRadius="50%"
            bg="var(--neon-cyan)"
            boxShadow="0 0 10px var(--neon-cyan)"
          />
        </Box>
        <Box
          as="h1"
          fontFamily="var(--font-neon-display), sans-serif"
          fontSize="18px"
          fontWeight={800}
          letterSpacing="-0.02em"
          color="#fff"
        >
          Neon UI
        </Box>
        <Box as="p" fontSize="11px" color="rgba(255,255,255,0.27)" mt="3px">
          Component Library v1.0
        </Box>
      </Box>

      {groups.map((group) => (
        <Box key={group.title}>
          <Box
            fontSize="10px"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing="0.12em"
            color="rgba(255,255,255,0.2)"
            px="24px"
            pt="12px"
            pb="6px"
          >
            {group.title}
          </Box>
          {group.items.map((item) => (
            <Box key={item.id} asChild>
              <a
                href={`#${item.id}`}
                className="neon-sidebar-link"
                style={{ textDecoration: "none" }}
              >
                <Box
                  w="6px"
                  h="6px"
                  borderRadius="50%"
                  bg="rgba(255,255,255,0.13)"
                />
                {item.label}
              </a>
            </Box>
          ))}
        </Box>
      ))}

      <Box
        mt="auto"
        pt="20px"
        px="24px"
        borderTop="1px solid var(--neon-border)"
      >
        <Box
          display="inline-flex"
          alignItems="center"
          gap="6px"
          bg="rgba(52,253,254,0.1)"
          border="1px solid rgba(52,253,254,0.3)"
          borderRadius="20px"
          px="10px"
          py="4px"
          fontSize="11px"
          fontWeight={600}
          color="var(--neon-cyan)"
          fontFamily="var(--font-neon-mono), monospace"
        >
          <Box
            w="6px"
            h="6px"
            borderRadius="50%"
            bg="var(--neon-cyan)"
            boxShadow="0 0 6px var(--neon-cyan)"
          />
          v1.0.0 · stable
        </Box>
      </Box>
    </Box>
  );
}

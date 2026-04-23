"use client";

import { Box } from "@chakra-ui/react";
import { Button } from "../Button";
import { Stat } from "../Stat";

export function Hero() {
  return (
    <Box
      as="section"
      px="60px"
      pt="80px"
      pb="60px"
      borderBottom="1px solid var(--neon-border)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        backgroundImage="linear-gradient(rgba(253,109,187,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(253,109,187,0.06) 1px, transparent 1px)"
        backgroundSize="40px 40px"
        css={{
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <Box position="relative" zIndex={1}>
        <Box
          display="inline-flex"
          alignItems="center"
          gap="8px"
          bg="rgba(253,109,187,0.1)"
          border="1px solid rgba(253,109,187,0.3)"
          borderRadius="20px"
          px="14px"
          py="5px"
          fontSize="12px"
          fontWeight={600}
          color="var(--neon-pink)"
          fontFamily="var(--font-neon-mono), monospace"
          mb="20px"
        >
          ✦ Chakra-inspired · Neon Aesthetic
        </Box>
        <Box
          as="h1"
          fontFamily="var(--font-neon-display), sans-serif"
          fontSize="64px"
          fontWeight={800}
          lineHeight="1"
          letterSpacing="-0.03em"
          mb="16px"
        >
          <span className="neon-grad-pink">Neon</span>
          <br />
          <span className="neon-grad-cyan">UI Kit</span>
        </Box>
        <Box
          as="p"
          fontSize="16px"
          color="var(--neon-text-muted)"
          maxW="520px"
          lineHeight="1.6"
          mb="32px"
        >
          A cyberpunk-themed component library built around electric pink and
          cyan. Every component glows, every interaction pulses.
        </Box>
        <Box display="flex" gap="12px" flexWrap="wrap">
          <Button colorScheme="pink" size="lg">
            Get Started
          </Button>
          <Button colorScheme="cyan" variant="outline" size="lg">
            View on GitHub
          </Button>
        </Box>
        <Box
          display="flex"
          gap="40px"
          mt="40px"
          pt="32px"
          borderTop="1px solid var(--neon-border)"
        >
          <Stat label="Components" value="18" />
          <Stat label="Primary Colors" value="2" accent="cyan" />
          <Stat label="Size Scales" value="5" />
          <Stat label="Vibes" value="∞" accent="cyan" />
        </Box>
      </Box>
    </Box>
  );
}

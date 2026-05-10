"use client";

import { Box } from "@chakra-ui/react";
import { Button } from "../Button";
import { Stat } from "../Stat";
import { Text } from "../Text";

export function Hero() {
  return (
    <Box
      as="section"
      px="60px"
      pt="80px"
      pb="60px"
      borderBottom="1px solid var(--color-border)"
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
        <Text
          variant="mono-sm"
          display="inline-flex"
          alignItems="center"
          gap="8px"
          bg="rgba(253,109,187,0.1)"
          border="1px solid rgba(253,109,187,0.3)"
          borderRadius="20px"
          px="14px"
          py="5px"
          fontWeight={600}
          color="var(--color-primary)"
          mb="20px"
        >
          ✦ Chakra-inspired · Neon Aesthetic
        </Text>
        <Box
          as="h1"
          fontFamily="var(--font-display), sans-serif"
          fontSize="64px"
          fontWeight={800}
          lineHeight="1"
          letterSpacing="-0.03em"
          mb="16px"
        >
          <span className="grad-primary">Neon</span>
          <br />
          <span className="grad-secondary">UI Kit</span>
        </Box>
        <Text
          variant="body-md"
          as="p"
          color="var(--color-text-muted)"
          maxW="520px"
          lineHeight="1.6"
          mb="32px"
        >
          A cyberpunk-themed component library built around electric pink and
          cyan. Every component glows, every interaction pulses.
        </Text>
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
          borderTop="1px solid var(--color-border)"
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

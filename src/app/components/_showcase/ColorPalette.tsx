"use client";

import { Box } from "@chakra-ui/react";
import { Text } from "../Text";

const swatches = [
  { name: "Pink 50", hex: "#fff0f8" },
  { name: "Pink 100", hex: "#ffe0f2" },
  { name: "Pink 200", hex: "#ffb3dd" },
  { name: "Pink 300", hex: "#ff80c4" },
  { name: "Pink 400", hex: "#fd6dbb" },
  { name: "Pink 500", hex: "#e8449a" },
  { name: "Pink 600", hex: "#c0317a" },
  { name: "Pink 700", hex: "#8f2059" },
  { name: "Pink 800", hex: "#5c1238" },
  { name: "Pink 900", hex: "#2d0519" },
  { name: "Cyan 50", hex: "#f0fffe" },
  { name: "Cyan 100", hex: "#d8ffff" },
  { name: "Cyan 200", hex: "#9bfdfe" },
  { name: "Cyan 300", hex: "#61fefe" },
  { name: "Cyan 400", hex: "#34fdfe" },
  { name: "Cyan 500", hex: "#00dcdd" },
  { name: "Cyan 600", hex: "#00adb0" },
  { name: "Cyan 700", hex: "#007f82" },
  { name: "Cyan 800", hex: "#004f51" },
  { name: "Cyan 900", hex: "#002223" },
];

const tokens = [
  {
    token: "--color-primary",
    value: "#fd6dbb",
    role: "Primary / Brand",
    use: "CTAs, highlights, active states",
  },
  {
    token: "--color-secondary",
    value: "#34fdfe",
    role: "Secondary / Accent",
    use: "Links, progress, info states",
  },
  {
    token: "--color-tertiary",
    value: "#4ade80",
    role: "Tertiary / Success",
    use: "Online status, success states",
  },
  {
    token: "--color-bg",
    value: "#070712",
    role: "Page Background",
    use: "App background",
  },
  {
    token: "--color-surface",
    value: "#0f0f1e",
    role: "Surface / Card",
    use: "Cards, modals, panels",
  },
  {
    token: "--color-surface-2",
    value: "#141428",
    role: "Surface Raised",
    use: "Inputs, dropdowns",
  },
  {
    token: "--color-border",
    value: "rgba(255,255,255,0.07)",
    role: "Border",
    use: "Dividers, outlines",
  },
];

function Swatch({ name, hex }: { name: string; hex: string }) {
  const darkBg = Number.parseInt(hex.slice(1, 3), 16) < 128;
  const textColor = darkBg ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";
  return (
    <Box
      h="80px"
      borderRadius="12px"
      display="flex"
      flexDirection="column"
      justifyContent="flex-end"
      p="10px 12px"
      bg={hex}
      transition="transform 0.2s"
      _hover={{ transform: "scale(1.02)" }}
    >
      <Text
        display="block"
        variant="mono-sm"
        fontWeight={700}
        color={textColor}
      >
        {name}
      </Text>
      <Text
        display="block"
        variant="mono-sm"
        opacity={0.7}
        color={textColor}
      >
        {hex}
      </Text>
    </Box>
  );
}

export function ColorPalette() {
  return (
    <Box
      as="section"
      id="colors"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Color System</SectionTitle>

      <SubSection title="Primary Palette">
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(120px, 1fr))"
          gap="10px"
        >
          {swatches.map((s) => (
            <Swatch key={s.name} {...s} />
          ))}
        </Box>
      </SubSection>

      <SubSection title="Semantic Tokens">
        <Box
          borderRadius="12px"
          overflow="hidden"
          border="1px solid var(--color-border)"
        >
          <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
            <Box as="thead" bg="rgba(255,255,255,0.03)">
              <Box as="tr">
                {["Token", "Value", "Role", "Usage"].map((h) => (
                  <Text
                    as="th"
                    key={h}
                    variant="label"
                    p="12px 16px"
                    textAlign="left"
                    color="var(--color-text-muted)"
                    borderBottom="1px solid var(--color-border)"
                  >
                    {h}
                  </Text>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {tokens.map((t) => (
                <Box
                  as="tr"
                  key={t.token}
                  borderBottom="1px solid rgba(255,255,255,0.03)"
                >
                  <Text
                    variant="mono-sm"
                    as="td"
                    p="12px 16px"
                    color="var(--color-primary)"
                  >
                    {t.token}
                  </Text>
                  <Box as="td" p="12px 16px">
                    <Box display="flex" alignItems="center" gap="8px">
                      <Box
                        w="18px"
                        h="18px"
                        borderRadius="4px"
                        bg={t.value}
                        border="1px solid rgba(255,255,255,0.2)"
                        flexShrink={0}
                      />
                      <Text
                        variant="mono-sm"
                        color="rgba(255,255,255,0.55)"
                      >
                        {t.value}
                      </Text>
                    </Box>
                  </Box>
                  <Text
                    variant="body-sm"
                    as="td"
                    p="12px 16px"
                    color="rgba(255,255,255,0.7)"
                  >
                    {t.role}
                  </Text>
                  <Text
                    variant="body-sm"
                    as="td"
                    p="12px 16px"
                    color="var(--color-text-muted)"
                  >
                    {t.use}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </SubSection>
    </Box>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      as="h2"
      variant="display-3xl"
      fontWeight={800}
      fontSize="28px"
      mb="36px"
      letterSpacing="-0.02em"
      style={{
        background: "linear-gradient(135deg, #fff 60%, rgba(255,255,255,0.4))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {children}
    </Text>
  );
}

export function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box mb="36px" _last={{ mb: 0 }}>
      <Text
        variant="body-xs"
        as="h3"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.1em"
        color="var(--color-text-dim)"
        mb="16px"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

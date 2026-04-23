"use client";

import { Box } from "@chakra-ui/react";

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
    token: "--neon-pink",
    value: "#FD6DBB",
    role: "Primary / Brand",
    use: "CTAs, highlights, active states",
  },
  {
    token: "--neon-cyan",
    value: "#34FDFE",
    role: "Secondary / Accent",
    use: "Links, progress, info states",
  },
  {
    token: "--neon-bg",
    value: "#070712",
    role: "Page Background",
    use: "App background",
  },
  {
    token: "--neon-surface",
    value: "#0f0f1e",
    role: "Surface / Card",
    use: "Cards, modals, panels",
  },
  {
    token: "--neon-surface-2",
    value: "#141428",
    role: "Surface Raised",
    use: "Inputs, dropdowns",
  },
  {
    token: "--neon-border",
    value: "rgba(255,255,255,0.08)",
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
      <Box
        fontSize="11px"
        fontWeight={700}
        fontFamily="var(--font-neon-mono), monospace"
        color={textColor}
      >
        {name}
      </Box>
      <Box
        fontSize="10px"
        opacity={0.7}
        fontFamily="var(--font-neon-mono), monospace"
        color={textColor}
      >
        {hex}
      </Box>
    </Box>
  );
}

export function ColorPalette() {
  return (
    <Box as="section" id="colors" px="60px" py="56px" borderBottom="1px solid var(--neon-border)">
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
          border="1px solid var(--neon-border)"
        >
          <Box as="table" w="full" style={{ borderCollapse: "collapse" }}>
            <Box as="thead" bg="rgba(255,255,255,0.03)">
              <Box as="tr">
                {["Token", "Value", "Role", "Usage"].map((h) => (
                  <Box
                    as="th"
                    key={h}
                    p="12px 16px"
                    textAlign="left"
                    fontSize="11px"
                    textTransform="uppercase"
                    letterSpacing="0.08em"
                    color="var(--neon-text-muted)"
                    borderBottom="1px solid var(--neon-border)"
                    fontWeight={600}
                  >
                    {h}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {tokens.map((t) => (
                <Box as="tr" key={t.token} borderBottom="1px solid rgba(255,255,255,0.03)">
                  <Box
                    as="td"
                    p="12px 16px"
                    fontFamily="var(--font-neon-mono), monospace"
                    fontSize="12px"
                    color="var(--neon-pink)"
                  >
                    {t.token}
                  </Box>
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
                      <Box
                        as="span"
                        fontFamily="var(--font-neon-mono), monospace"
                        fontSize="11px"
                        color="rgba(255,255,255,0.55)"
                      >
                        {t.value}
                      </Box>
                    </Box>
                  </Box>
                  <Box as="td" p="12px 16px" color="rgba(255,255,255,0.7)" fontSize="13px">
                    {t.role}
                  </Box>
                  <Box as="td" p="12px 16px" color="var(--neon-text-muted)" fontSize="13px">
                    {t.use}
                  </Box>
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
    <Box
      as="h2"
      fontFamily="var(--font-neon-display), sans-serif"
      fontSize="28px"
      fontWeight={800}
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
    </Box>
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
      <Box
        as="h3"
        fontSize="12px"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.1em"
        color="var(--neon-text-dim)"
        mb="16px"
      >
        {title}
      </Box>
      {children}
    </Box>
  );
}

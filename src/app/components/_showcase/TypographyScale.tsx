"use client";

import { Box } from "@chakra-ui/react";
import { SectionTitle, SubSection } from "./ColorPalette";

interface Row {
  name: string;
  size: string;
  weight: number;
  lh?: string;
}

const displayScale: Row[] = [
  { name: "7xl", size: "72px", weight: 800, lh: "1" },
  { name: "6xl", size: "56px", weight: 800, lh: "1.05" },
  { name: "5xl", size: "40px", weight: 700, lh: "1.1" },
  { name: "4xl", size: "32px", weight: 700, lh: "1.15" },
  { name: "3xl", size: "24px", weight: 700, lh: "1.2" },
  { name: "2xl", size: "20px", weight: 600, lh: "1.3" },
];

const bodyScale: Row[] = [
  { name: "lg", size: "18px", weight: 400 },
  { name: "md", size: "16px", weight: 400 },
  { name: "sm", size: "14px", weight: 400 },
  { name: "xs", size: "12px", weight: 400 },
];

const monoScale: Row[] = [
  { name: "lg", size: "16px", weight: 400 },
  { name: "md", size: "14px", weight: 400 },
  { name: "sm", size: "12px", weight: 400 },
];

function TypeRow({
  row,
  fontFamily,
  sample,
}: {
  row: Row;
  fontFamily: string;
  sample: string;
}) {
  return (
    <Box
      display="flex"
      alignItems="baseline"
      gap="20px"
      py="12px"
      borderBottom="1px solid var(--neon-border)"
    >
      <Box
        fontSize="11px"
        color="var(--neon-text-dim)"
        fontFamily="var(--font-neon-mono), monospace"
        w="100px"
        flexShrink={0}
      >
        {row.name} · {row.size}
      </Box>
      <Box
        fontFamily={fontFamily}
        fontSize={row.size}
        fontWeight={row.weight}
        lineHeight={row.lh ?? "1.5"}
        color="#fff"
        textWrap="pretty"
      >
        {sample}
      </Box>
    </Box>
  );
}

export function TypographyScale() {
  return (
    <Box
      as="section"
      id="typography"
      px="60px"
      py="56px"
      borderBottom="1px solid var(--neon-border)"
    >
      <SectionTitle>Typography</SectionTitle>
      <SubSection title="Display — Syne">
        {displayScale.map((r) => (
          <TypeRow
            key={r.name}
            row={r}
            fontFamily="var(--font-neon-display), sans-serif"
            sample="The quick neon fox"
          />
        ))}
      </SubSection>
      <SubSection title="Body — Space Grotesk">
        {bodyScale.map((r) => (
          <TypeRow
            key={r.name}
            row={r}
            fontFamily="var(--font-neon-body), sans-serif"
            sample="The quick brown fox jumps over the lazy dog. Cyberpunk interfaces deserve beautiful typography."
          />
        ))}
      </SubSection>
      <SubSection title="Mono — Space Mono">
        {monoScale.map((r) => (
          <TypeRow
            key={r.name}
            row={r}
            fontFamily="var(--font-neon-mono), monospace"
            sample={'const color = "#FD6DBB"; // electric pink'}
          />
        ))}
      </SubSection>
    </Box>
  );
}

"use client";

import { Box } from "@chakra-ui/react";
import { Text, type TextVariant } from "../Text";
import { SectionTitle, SubSection } from "./ColorPalette";

const displayVariants: { variant: TextVariant; size: string }[] = [
  { variant: "display-7xl", size: "72px" },
  { variant: "display-6xl", size: "56px" },
  { variant: "display-5xl", size: "40px" },
  { variant: "display-4xl", size: "32px" },
  { variant: "display-3xl", size: "24px" },
  { variant: "display-2xl", size: "20px" },
];

const bodyVariants: { variant: TextVariant; size: string }[] = [
  { variant: "body-lg", size: "18px" },
  { variant: "body-md", size: "16px" },
  { variant: "body-sm", size: "14px" },
  { variant: "body-xs", size: "12px" },
];

const monoVariants: { variant: TextVariant; size: string }[] = [
  { variant: "mono-lg", size: "16px" },
  { variant: "mono-md", size: "14px" },
  { variant: "mono-sm", size: "12px" },
];

function TypeRow({
  variant,
  size,
  sample,
}: {
  variant: TextVariant;
  size: string;
  sample: string;
}) {
  const name = variant.split("-").slice(1).join("-");
  return (
    <Box
      display="flex"
      alignItems="baseline"
      gap="20px"
      py="12px"
      borderBottom="1px solid var(--color-border)"
    >
      <Text
        variant="mono-sm"
        color="var(--color-text-dim)"
        w="100px"
        flexShrink={0}
      >
        {name} · {size}
      </Text>
      <Text variant={variant} color="#fff" textWrap="pretty">
        {sample}
      </Text>
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
      borderBottom="1px solid var(--color-border)"
    >
      <SectionTitle>Typography</SectionTitle>
      <SubSection title="Display — Syne">
        {displayVariants.map((r) => (
          <TypeRow
            key={r.variant}
            variant={r.variant}
            size={r.size}
            sample="The quick neon fox"
          />
        ))}
      </SubSection>
      <SubSection title="Body — Space Grotesk">
        {bodyVariants.map((r) => (
          <TypeRow
            key={r.variant}
            variant={r.variant}
            size={r.size}
            sample="The quick brown fox jumps over the lazy dog. Cyberpunk interfaces deserve beautiful typography."
          />
        ))}
      </SubSection>
      <SubSection title="Mono — Space Mono">
        {monoVariants.map((r) => (
          <TypeRow
            key={r.variant}
            variant={r.variant}
            size={r.size}
            sample={'const color = "#FD6DBB"; // electric pink'}
          />
        ))}
      </SubSection>
    </Box>
  );
}

"use client";

import { Box } from "@chakra-ui/react";
import {
  LuCheck,
  LuEllipsisVertical,
  LuShare,
  LuSmartphone,
} from "react-icons/lu";
import { BottomSheet } from "@/app/components/BottomSheet";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";

type OS = "ios" | "android";

function detectOS(): OS {
  if (typeof window === "undefined") return "ios";
  return /android/i.test(navigator.userAgent) ? "android" : "ios";
}

const IOS_STEPS = [
  {
    icon: <LuShare size={17} />,
    text: 'Tap the Share button at the bottom of Safari',
  },
  {
    icon: <LuSmartphone size={17} />,
    text: 'Scroll down and tap "Add to Home Screen"',
  },
  {
    icon: <LuCheck size={17} />,
    text: 'Tap "Add" in the top-right corner',
  },
];

const ANDROID_STEPS = [
  {
    icon: <LuEllipsisVertical size={17} />,
    text: "Tap the menu button (⋮) in Chrome's top-right corner",
  },
  {
    icon: <LuSmartphone size={17} />,
    text: 'Tap "Add to Home screen"',
  },
  {
    icon: <LuCheck size={17} />,
    text: 'Tap "Add" to confirm',
  },
];

interface Props {
  onClose: () => void;
}

export function InstallGuideSheet({ onClose }: Props) {
  const os = detectOS();
  const steps = os === "android" ? ANDROID_STEPS : IOS_STEPS;

  return (
    <BottomSheet
      onClose={onClose}
      title="Add to Home Screen"
      subtitle={
        os === "ios"
          ? "Install via Safari on iPhone or iPad"
          : "Install via Chrome on Android"
      }
      footer={
        <Button variant="solid" colorScheme="pink" w="100%" onClick={onClose}>
          Got it
        </Button>
      }
    >
      <Text
        as="p"
        variant="body-sm"
        color="var(--color-text-muted)"
        mb={4}
        px={1}
        lineHeight="1.6"
      >
        Install this app on your home screen for the best experience — it works
        offline and feels like a native app.
      </Text>
      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {steps.map((step, i) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered
            key={i}
            display="flex"
            alignItems="center"
            gap={3}
            p="12px 14px"
            borderRadius="10px"
            style={{
              background: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "rgba(253, 109, 187, 0.12)",
                color: "var(--color-primary)",
                flexShrink: 0,
              }}
            >
              {step.icon}
            </Box>
            <Box display="flex" alignItems="baseline" gap="6px" flex={1}>
              <Text
                variant="label"
                style={{ color: "var(--color-primary)", flexShrink: 0 }}
              >
                {i + 1}
              </Text>
              <Text variant="body-sm" style={{ color: "var(--color-text)" }}>
                {step.text}
              </Text>
            </Box>
          </Box>
        ))}
      </Box>
    </BottomSheet>
  );
}

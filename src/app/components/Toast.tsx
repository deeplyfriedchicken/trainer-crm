"use client";

import { Toaster as ChakraToaster, Toast, createToaster } from "@chakra-ui/react";

export const toaster = createToaster({
  placement: "bottom-end",
  overlap: true,
  max: 4,
});

export type NeonToastType = "info" | "success" | "warning" | "error";

const palette: Record<NeonToastType, { color: string; soft: string }> = {
  info: { color: "var(--neon-cyan)", soft: "rgba(52,253,254,0.12)" },
  success: { color: "#4ade80", soft: "rgba(74,222,128,0.12)" },
  warning: { color: "#fbbf24", soft: "rgba(251,191,36,0.12)" },
  error: { color: "#ff5472", soft: "rgba(255,84,114,0.12)" },
};

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: "16px" }}>
      {(toast) => {
        const type = (toast.type ?? "info") as NeonToastType;
        const p = palette[type];
        return (
          <Toast.Root
            w={{ base: "calc(100vw - 32px)", md: "360px" }}
            bg="var(--neon-surface)"
            color="var(--neon-text)"
            border="1px solid"
            borderColor={`${p.color}66`}
            borderRadius="12px"
            boxShadow={`0 0 24px ${p.color}44, 0 20px 40px rgba(0,0,0,0.5)`}
            p="14px 16px"
            display="flex"
            alignItems="flex-start"
            gap="12px"
            fontFamily="var(--font-neon-body), sans-serif"
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              {toast.title && (
                <Toast.Title fontSize="13px" fontWeight={700}>
                  {toast.title}
                </Toast.Title>
              )}
              {toast.description && (
                <Toast.Description
                  fontSize="12px"
                  color="var(--neon-text-muted)"
                  lineHeight="1.5"
                >
                  {toast.description}
                </Toast.Description>
              )}
            </div>
            <Toast.CloseTrigger
              bg="transparent"
              color="var(--neon-text-muted)"
              border="none"
              cursor="pointer"
              fontSize="16px"
              p="2px 6px"
              borderRadius="6px"
              _hover={{ bg: "rgba(255,255,255,0.06)", color: "var(--neon-text)" }}
            >
              ×
            </Toast.CloseTrigger>
          </Toast.Root>
        );
      }}
    </ChakraToaster>
  );
}

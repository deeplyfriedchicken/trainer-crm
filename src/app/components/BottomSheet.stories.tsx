"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { LuChevronRight } from "react-icons/lu";
import { BottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { Textarea } from "./Textarea";

const meta: Meta = {
  title: "Components/BottomSheet",
  parameters: { layout: "centered" },
};

export default meta;

function Demo({
  title,
  subtitle,
  withFooter,
  withTitleAction,
}: {
  title?: string;
  subtitle?: string;
  withFooter?: boolean;
  withTitleAction?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Sheet</Button>
      {open && (
        <BottomSheet
          onClose={() => setOpen(false)}
          title={title}
          subtitle={subtitle}
          titleAction={
            withTitleAction ? (
              <IconButton
                variant="ghost"
                colorScheme="neutral"
                size="sm"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                ×
              </IconButton>
            ) : undefined
          }
          footer={
            withFooter ? (
              <div style={{ display: "flex", gap: 10 }}>
                <Button
                  variant="ghost"
                  colorScheme="neutral"
                  style={{ flex: 1 }}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  colorScheme="cyan"
                  style={{ flex: 2 }}
                  onClick={() => setOpen(false)}
                >
                  Confirm
                </Button>
              </div>
            ) : undefined
          }
        >
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              This is the scrollable body. Any content can go here — lists,
              forms, media.
            </p>
            <Textarea
              colorScheme="cyan"
              placeholder="Optional text input…"
              rows={3}
              w="100%"
            />
          </div>
        </BottomSheet>
      )}
    </>
  );
}

export const Basic: StoryObj = {
  render: () => <Demo title="Choose a Plan" />,
};

export const WithSubtitle: StoryObj = {
  render: () => (
    <Demo
      title="Session Complete 🎉"
      subtitle="Duration: 42:15 · How did it go?"
    />
  ),
};

export const WithFooter: StoryObj = {
  render: () => (
    <Demo
      title="Add Notes"
      subtitle="Optional — jot down how the session felt"
      withFooter
    />
  ),
};

export const WithTitleAction: StoryObj = {
  render: () => (
    <Demo title="Demo Video" subtitle="Exercise walkthrough" withTitleAction />
  ),
};

export const ListContent: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    const plans = ["Lower Body Power", "Upper Push Day", "Full Body HIIT", "Core & Mobility"];
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Sheet</Button>
        {open && (
          <BottomSheet onClose={() => setOpen(false)} title="Choose a Workout Plan">
            {plans.map((p) => (
              <div
                key={p}
                onClick={() => setOpen(false)}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                    boxShadow: "0 0 6px var(--color-primary)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "#fff" }}>{p}</span>
                <LuChevronRight size={14} color="rgba(255,255,255,0.3)" />
              </div>
            ))}
            <div style={{ height: 16 }} />
          </BottomSheet>
        )}
      </>
    );
  },
};

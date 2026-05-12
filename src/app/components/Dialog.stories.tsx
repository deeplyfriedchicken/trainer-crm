"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "./Button";
import { Dialog, DialogBody } from "./Dialog";

const meta: Meta = {
  title: "Components/Dialog",
  parameters: { layout: "centered" },
};

export default meta;

function DialogDemo({
  title,
  maxWidth,
}: {
  title?: string;
  maxWidth?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title={title}
        maxWidth={maxWidth}
      >
        <DialogBody>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            This is the dialog body. You can put any content here — forms,
            details, confirmations.
          </p>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Confirm
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

export const WithTitle: StoryObj = {
  render: () => <DialogDemo title="Confirm Action" />,
};

export const NoTitle: StoryObj = {
  render: () => <DialogDemo />,
};

export const NarrowWidth: StoryObj = {
  render: () => <DialogDemo title="Delete Item" maxWidth={420} />,
};

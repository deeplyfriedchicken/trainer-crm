"use client";

import { VStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { Toaster, toaster } from "./Toast";

const meta: Meta = {
  title: "Components/Toast",
  parameters: { layout: "centered" },
};

export default meta;

function ToastDemo() {
  return (
    <>
      <Toaster />
      <VStack gap="10px">
        <Button
          colorScheme="cyan"
          variant="outline"
          onClick={() =>
            toaster.create({
              type: "info",
              title: "Info",
              description: "This is an informational toast.",
            })
          }
        >
          Info Toast
        </Button>
        <Button
          colorScheme="cyan"
          variant="outline"
          onClick={() =>
            toaster.create({
              type: "success",
              title: "Success!",
              description: "Your changes were saved.",
            })
          }
        >
          Success Toast
        </Button>
        <Button
          colorScheme="pink"
          variant="outline"
          onClick={() =>
            toaster.create({
              type: "warning",
              title: "Warning",
              description: "This action may have side effects.",
            })
          }
        >
          Warning Toast
        </Button>
        <Button
          colorScheme="pink"
          variant="outline"
          onClick={() =>
            toaster.create({
              type: "error",
              title: "Error",
              description: "Something went wrong. Please try again.",
            })
          }
        >
          Error Toast
        </Button>
        <Button
          variant="ghost"
          onClick={() => toaster.create({ type: "info", title: "Title only" })}
        >
          Title Only
        </Button>
      </VStack>
    </>
  );
}

export const Interactive: StoryObj = {
  render: () => <ToastDemo />,
};

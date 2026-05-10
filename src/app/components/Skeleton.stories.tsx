import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack, HStack } from "@chakra-ui/react";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { height: "20px", width: "200px" },
};

export const TextBlock: Story = {
  render: () => (
    <VStack gap="8px" align="stretch" w="320px">
      <Skeleton height="16px" width="60%" />
      <Skeleton height="14px" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="80%" />
    </VStack>
  ),
};

export const Card: Story = {
  render: () => (
    <VStack gap="12px" align="stretch" w="320px">
      <Skeleton height="160px" borderRadius="12px" />
      <Skeleton height="18px" width="70%" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="50%" />
    </VStack>
  ),
};

export const Table: Story = {
  render: () => (
    <VStack gap="6px" align="stretch" w="500px">
      <HStack gap="8px">
        <Skeleton height="14px" flex={2} />
        <Skeleton height="14px" flex={1} />
        <Skeleton height="14px" flex={1} />
      </HStack>
      {[1, 2, 3, 4].map((i) => (
        <HStack key={i} gap="8px">
          <Skeleton height="40px" flex={2} />
          <Skeleton height="40px" flex={1} />
          <Skeleton height="40px" flex={1} />
        </HStack>
      ))}
    </VStack>
  ),
};

import { HStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Spinner } from "./Spinner";

const meta: Meta<typeof Spinner> = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: { colorScheme: "pink", size: "md" },
};

export const Cyan: Story = {
  args: { colorScheme: "cyan", size: "md" },
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap="24px" align="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </HStack>
  ),
};

export const BothSchemes: Story = {
  render: () => (
    <HStack gap="24px" align="center">
      <Spinner colorScheme="pink" size="lg" />
      <Spinner colorScheme="cyan" size="lg" />
    </HStack>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HStack, VStack } from "@chakra-ui/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    variant: { control: "select", options: ["solid", "outline", "ghost", "link"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Click me", colorScheme: "pink", variant: "solid", size: "md" },
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap="12px" flexWrap="wrap">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </HStack>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap="12px" align="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </HStack>
  ),
};

export const CyanScheme: Story = {
  render: () => (
    <HStack gap="12px" flexWrap="wrap">
      <Button colorScheme="cyan" variant="solid">Solid</Button>
      <Button colorScheme="cyan" variant="outline">Outline</Button>
      <Button colorScheme="cyan" variant="ghost">Ghost</Button>
      <Button colorScheme="cyan" variant="link">Link</Button>
    </HStack>
  ),
};

export const Loading: Story = {
  args: { children: "Saving…", loading: true },
};

export const Disabled: Story = {
  args: { children: "Disabled", disabled: true },
};

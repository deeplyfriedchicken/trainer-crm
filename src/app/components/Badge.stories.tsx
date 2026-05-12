import { HStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    variant: { control: "select", options: ["solid", "subtle", "outline"] },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Badge", colorScheme: "pink", variant: "subtle" },
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap="8px" flexWrap="wrap">
      <Badge colorScheme="pink" variant="solid">
        Solid Pink
      </Badge>
      <Badge colorScheme="pink" variant="subtle">
        Subtle Pink
      </Badge>
      <Badge colorScheme="pink" variant="outline">
        Outline Pink
      </Badge>
      <Badge colorScheme="cyan" variant="solid">
        Solid Cyan
      </Badge>
      <Badge colorScheme="cyan" variant="subtle">
        Subtle Cyan
      </Badge>
      <Badge colorScheme="cyan" variant="outline">
        Outline Cyan
      </Badge>
    </HStack>
  ),
};

export const Solid: Story = {
  args: { children: "Active", colorScheme: "pink", variant: "solid" },
};

export const Subtle: Story = {
  args: { children: "Pending", colorScheme: "cyan", variant: "subtle" },
};

export const Outline: Story = {
  args: { children: "Draft", colorScheme: "pink", variant: "outline" },
};

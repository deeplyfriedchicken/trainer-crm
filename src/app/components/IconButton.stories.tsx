import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HStack } from "@chakra-ui/react";
import { LuSearch, LuBell, LuPlus, LuSettings } from "react-icons/lu";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    variant: { control: "select", options: ["solid", "outline", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: { "aria-label": "Search", children: <LuSearch /> },
};

export const AllVariants: Story = {
  render: () => (
    <HStack gap="10px">
      <IconButton aria-label="Add" variant="solid"><LuPlus /></IconButton>
      <IconButton aria-label="Add" variant="outline"><LuPlus /></IconButton>
      <IconButton aria-label="Add" variant="ghost"><LuPlus /></IconButton>
    </HStack>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap="10px" align="center">
      <IconButton aria-label="Bell" size="sm"><LuBell /></IconButton>
      <IconButton aria-label="Bell" size="md"><LuBell /></IconButton>
      <IconButton aria-label="Bell" size="lg"><LuBell /></IconButton>
      <IconButton aria-label="Bell" size="xl"><LuBell /></IconButton>
    </HStack>
  ),
};

export const CyanScheme: Story = {
  render: () => (
    <HStack gap="10px">
      <IconButton aria-label="Settings" colorScheme="cyan" variant="solid"><LuSettings /></IconButton>
      <IconButton aria-label="Settings" colorScheme="cyan" variant="outline"><LuSettings /></IconButton>
      <IconButton aria-label="Settings" colorScheme="cyan" variant="ghost"><LuSettings /></IconButton>
    </HStack>
  ),
};

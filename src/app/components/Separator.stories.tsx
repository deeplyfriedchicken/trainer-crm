import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack, Box } from "@chakra-ui/react";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Components/Separator",
  component: Separator,
  parameters: { layout: "padded" },
  argTypes: {
    accent: { control: "select", options: ["none", "pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <Box w="400px">
      <Box mb="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section A</Box>
      <Separator accent="none" />
      <Box mt="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section B</Box>
    </Box>
  ),
};

export const PinkAccent: Story = {
  render: () => (
    <Box w="400px">
      <Box mb="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section A</Box>
      <Separator accent="pink" />
      <Box mt="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section B</Box>
    </Box>
  ),
};

export const CyanAccent: Story = {
  render: () => (
    <Box w="400px">
      <Box mb="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section A</Box>
      <Separator accent="cyan" />
      <Box mt="12px" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Section B</Box>
    </Box>
  ),
};

export const AllAccents: Story = {
  render: () => (
    <VStack gap="20px" align="stretch" w="400px">
      <Separator accent="none" />
      <Separator accent="pink" />
      <Separator accent="cyan" />
    </VStack>
  ),
};

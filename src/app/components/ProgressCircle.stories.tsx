import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { HStack } from "@chakra-ui/react";
import { ProgressCircle } from "./ProgressCircle";

const meta: Meta<typeof ProgressCircle> = {
  title: "Components/ProgressCircle",
  component: ProgressCircle,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Default: Story = {
  args: { value: 65 },
};

export const Cyan: Story = {
  args: { value: 80, colorScheme: "cyan" },
};

export const AllSizes: Story = {
  render: () => (
    <HStack gap="24px" align="center">
      <ProgressCircle value={60} size="sm" />
      <ProgressCircle value={60} size="md" />
      <ProgressCircle value={60} size="lg" />
      <ProgressCircle value={60} size="xl" />
    </HStack>
  ),
};

export const Indeterminate: Story = {
  args: { value: null, showValueText: false },
};

export const Complete: Story = {
  args: { value: 100, colorScheme: "cyan", size: "lg" },
};

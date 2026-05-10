import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack } from "@chakra-ui/react";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  parameters: { layout: "padded" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60, style: { width: 320 } },
};

export const WithLabel: Story = {
  args: { value: 75, label: "Upload Progress", showValueText: true, style: { width: 320 } },
};

export const Cyan: Story = {
  args: { value: 45, colorScheme: "cyan", label: "Capacity", showValueText: true, style: { width: 320 } },
};

export const Indeterminate: Story = {
  args: { value: null, label: "Processing…", style: { width: 320 } },
};

export const AllStates: Story = {
  render: () => (
    <VStack gap="18px" align="stretch" w="320px">
      <Progress value={25} label="Beginner" showValueText />
      <Progress value={50} colorScheme="cyan" label="Intermediate" showValueText />
      <Progress value={80} label="Advanced" showValueText />
      <Progress value={null} label="Syncing…" />
    </VStack>
  ),
};

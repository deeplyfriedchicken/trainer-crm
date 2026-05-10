import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack } from "@chakra-ui/react";
import { Input } from "./Input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text…", style: { width: 280 } },
};

export const WithValue: Story = {
  args: { defaultValue: "Jane Smith", style: { width: 280 } },
};

export const Cyan: Story = {
  args: { placeholder: "Cyan focus ring", colorScheme: "cyan", style: { width: 280 } },
};

export const Invalid: Story = {
  args: { placeholder: "Invalid input", invalid: true, style: { width: 280 } },
};

export const Disabled: Story = {
  args: { value: "Read-only value", disabled: true, style: { width: 280 } },
};

export const AllSizes: Story = {
  render: () => (
    <VStack gap="10px" align="stretch" w="280px">
      <Input size="sm" placeholder="Small" />
      <Input size="md" placeholder="Medium (default)" />
      <Input size="lg" placeholder="Large" />
    </VStack>
  ),
};

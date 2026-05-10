import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack } from "@chakra-ui/react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

const roleOptions = [
  { value: "trainer", label: "Trainer" },
  { value: "trainee", label: "Trainee" },
  { value: "admin", label: "Admin" },
];

export const Default: Story = {
  args: {
    options: roleOptions,
    placeholder: "Select a role",
    style: { width: 280 },
  },
};

export const WithValue: Story = {
  args: {
    options: roleOptions,
    defaultValue: "trainer",
    style: { width: 280 },
  },
};

export const Cyan: Story = {
  args: {
    options: roleOptions,
    placeholder: "Select a role",
    colorScheme: "cyan",
    style: { width: 280 },
  },
};

export const Invalid: Story = {
  args: {
    options: roleOptions,
    placeholder: "Select a role",
    invalid: true,
    style: { width: 280 },
  },
};

export const AllSizes: Story = {
  render: () => (
    <VStack gap="10px" align="stretch" w="280px">
      <Select size="sm" options={roleOptions} placeholder="Small" />
      <Select size="md" options={roleOptions} placeholder="Medium (default)" />
      <Select size="lg" options={roleOptions} placeholder="Large" />
    </VStack>
  ),
};

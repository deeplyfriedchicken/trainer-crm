import { VStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";

const meta: Meta<typeof Field> = {
  title: "Components/Field",
  component: Field,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field label="Email address">
      <Input placeholder="you@example.com" />
    </Field>
  ),
};

export const Required: Story = {
  render: () => (
    <Field label="Full name" required>
      <Input placeholder="Jane Smith" />
    </Field>
  ),
};

export const WithHelperText: Story = {
  render: () => (
    <Field
      label="Username"
      helperText="Only letters, numbers, and underscores."
    >
      <Input placeholder="trainer_pro" />
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field
      label="Email"
      invalid
      errorText="Please enter a valid email address."
    >
      <Input placeholder="you@example.com" invalid />
    </Field>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Field label="Account ID" disabled>
      <Input value="usr_abc123" disabled />
    </Field>
  ),
};

export const WithSelect: Story = {
  render: () => (
    <Field label="Role" required helperText="Controls dashboard access level.">
      <Select
        options={[
          { value: "trainer", label: "Trainer" },
          { value: "admin", label: "Admin" },
          { value: "trainee", label: "Trainee" },
        ]}
        placeholder="Select role"
      />
    </Field>
  ),
};

export const Stacked: Story = {
  render: () => (
    <VStack gap="18px" align="stretch" maxW="400px">
      <Field label="First name" required>
        <Input placeholder="Jane" />
      </Field>
      <Field label="Last name" required>
        <Input placeholder="Smith" />
      </Field>
      <Field label="Email" invalid errorText="Email already in use.">
        <Input placeholder="jane@example.com" invalid />
      </Field>
    </VStack>
  ),
};

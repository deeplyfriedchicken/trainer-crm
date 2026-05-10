import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VStack } from "@chakra-ui/react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { children: "Accept terms and conditions" },
};

export const Checked: Story = {
  args: { children: "Already checked", defaultChecked: true },
};

export const Cyan: Story = {
  args: { children: "Cyan checkbox", colorScheme: "cyan", defaultChecked: true },
};

export const Disabled: Story = {
  args: { children: "Disabled option", disabled: true },
};

export const DisabledChecked: Story = {
  args: { children: "Disabled & checked", disabled: true, defaultChecked: true },
};

export const Group: Story = {
  render: () => (
    <VStack align="flex-start" gap="10px">
      <Checkbox defaultChecked>Push notifications</Checkbox>
      <Checkbox defaultChecked colorScheme="cyan">Email updates</Checkbox>
      <Checkbox>SMS alerts</Checkbox>
      <Checkbox disabled>Legacy (deprecated)</Checkbox>
    </VStack>
  ),
};

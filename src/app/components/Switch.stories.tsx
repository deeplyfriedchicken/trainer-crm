import { VStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: { children: "Enable notifications" },
};

export const Checked: Story = {
  args: { children: "Notifications enabled", defaultChecked: true },
};

export const Cyan: Story = {
  args: { children: "Cyan toggle", colorScheme: "cyan", defaultChecked: true },
};

export const NoLabel: Story = {
  args: { defaultChecked: true },
};

export const Disabled: Story = {
  args: { children: "Disabled switch", disabled: true },
};

export const DisabledChecked: Story = {
  args: { children: "Disabled & on", disabled: true, defaultChecked: true },
};

export const Group: Story = {
  render: () => (
    <VStack align="flex-start" gap="12px">
      <Switch defaultChecked>Push notifications</Switch>
      <Switch defaultChecked colorScheme="cyan">
        Email digests
      </Switch>
      <Switch>SMS alerts</Switch>
      <Switch disabled>Legacy webhooks (deprecated)</Switch>
    </VStack>
  ),
};

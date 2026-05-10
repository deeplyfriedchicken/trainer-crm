import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Radio } from "./Radio";

const meta: Meta<typeof Radio> = {
  title: "Components/Radio",
  component: Radio,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
    orientation: { control: "select", options: ["vertical", "horizontal"] },
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

const roleOptions = [
  { value: "trainer", label: "Trainer" },
  { value: "trainee", label: "Trainee" },
  { value: "admin", label: "Admin" },
];

export const Vertical: Story = {
  args: {
    options: roleOptions,
    defaultValue: "trainer",
    orientation: "vertical",
  },
};

export const Horizontal: Story = {
  args: {
    options: roleOptions,
    defaultValue: "trainee",
    orientation: "horizontal",
  },
};

export const Cyan: Story = {
  args: {
    options: roleOptions,
    defaultValue: "admin",
    colorScheme: "cyan",
  },
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { value: "reps", label: "Reps" },
      { value: "duration", label: "Duration" },
      { value: "custom", label: "Custom (coming soon)", disabled: true },
    ],
    defaultValue: "reps",
  },
};

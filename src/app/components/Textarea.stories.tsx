import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["pink", "cyan"] },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Add a note…",
    rows: 4,
    style: { width: 320 },
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      "Good effort today. Focus on keeping your back straight during deadlifts next session.",
    rows: 4,
    style: { width: 320 },
  },
};

export const Cyan: Story = {
  args: {
    placeholder: "Cyan focus ring…",
    colorScheme: "cyan",
    rows: 4,
    style: { width: 320 },
  },
};

export const Invalid: Story = {
  args: {
    placeholder: "Required field",
    invalid: true,
    rows: 4,
    style: { width: 320 },
  },
};

export const Disabled: Story = {
  args: {
    value: "Read-only note content.",
    disabled: true,
    rows: 3,
    style: { width: 320 },
  },
};

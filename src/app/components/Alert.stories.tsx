import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  argTypes: {
    status: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: {
    status: "info",
    title: "Heads up",
    children: "This is an informational message with some details below.",
  },
};

export const Success: Story = {
  args: {
    status: "success",
    title: "All done!",
    children: "Your changes have been saved successfully.",
  },
};

export const Warning: Story = {
  args: {
    status: "warning",
    title: "Proceed with caution",
    children: "This action may have unintended side effects.",
  },
};

export const Error: Story = {
  args: {
    status: "error",
    title: "Something went wrong",
    children: "Unable to save your changes. Please try again.",
  },
};

export const TitleOnly: Story = {
  args: {
    status: "info",
    title: "No description needed",
  },
};

export const DescriptionOnly: Story = {
  args: {
    status: "success",
    children: "Saved without a title.",
  },
};

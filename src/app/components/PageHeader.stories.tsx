import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { PageHeader } from "./PageHeader";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const TitleOnly: Story = {
  args: { title: "Dashboard" },
};

export const WithSubtitle: Story = {
  args: {
    title: "Trainees",
    subtitle: "12 active clients",
  },
};

export const WithAction: Story = {
  args: {
    title: "Videos",
    subtitle: "Manage workout recordings",
    action: <Button size="sm">Upload Video</Button>,
  },
};

export const LongTitle: Story = {
  args: {
    title: "Workout Plan — Advanced Strength Block",
    subtitle: "6-week periodized program",
    action: (
      <Button size="sm" variant="outline">
        Edit Plan
      </Button>
    ),
  },
};

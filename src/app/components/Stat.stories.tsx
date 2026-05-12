import { HStack } from "@chakra-ui/react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Stat } from "./Stat";

const meta: Meta<typeof Stat> = {
  title: "Components/Stat",
  component: Stat,
  parameters: { layout: "centered" },
  argTypes: {
    accent: { control: "select", options: ["pink", "cyan"] },
    indicator: { control: "select", options: [null, "up", "down"] },
  },
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: { label: "Active Clients", value: "24", accent: "pink" },
};

export const WithTrend: Story = {
  args: {
    label: "Sessions This Week",
    value: "18",
    helpText: "+3 from last week",
    indicator: "up",
    accent: "cyan",
  },
};

export const NegativeTrend: Story = {
  args: {
    label: "Completed Workouts",
    value: "5",
    helpText: "-2 from last week",
    indicator: "down",
  },
};

export const Dashboard: Story = {
  render: () => (
    <HStack gap="40px" flexWrap="wrap">
      <Stat
        label="Active Clients"
        value="24"
        accent="pink"
        helpText="+4 this month"
        indicator="up"
      />
      <Stat label="Sessions Today" value="8" accent="cyan" />
      <Stat
        label="Videos Uploaded"
        value="142"
        accent="pink"
        helpText="-5 from last week"
        indicator="down"
      />
      <Stat
        label="Avg Energy Rating"
        value="3.8"
        accent="cyan"
        helpText="Stable"
      />
    </HStack>
  ),
};

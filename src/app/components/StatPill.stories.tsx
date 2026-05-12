import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { StatPill } from "./StatPill";

const meta: Meta<typeof StatPill> = {
  title: "Components/StatPill",
  component: StatPill,
  parameters: { layout: "centered" },
  argTypes: {
    colorScheme: { control: "select", options: ["cyan", "pink"] },
  },
};

export default meta;
type Story = StoryObj<typeof StatPill>;

export const Default: Story = {
  args: { label: "Sets", value: 4 },
};

export const WithUnit: Story = {
  args: { label: "Reps", value: 10, unit: "per set" },
};

export const PinkScheme: Story = {
  args: { label: "Volume", value: 40, unit: "total reps", colorScheme: "pink" },
};

export const ExerciseGrid: StoryObj = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 120px)",
        gap: 8,
      }}
    >
      <StatPill label="Sets" value={4} />
      <StatPill label="Reps" value={10} unit="per set" />
      <StatPill label="Volume" value={40} unit="total reps" />
    </div>
  ),
};

export const DurationExercise: StoryObj = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 120px)",
        gap: 8,
      }}
    >
      <StatPill label="Sets" value={3} />
      <StatPill label="Duration" value={45} unit="sec / set" />
      <StatPill label="Total" value={135} unit="seconds" />
    </div>
  ),
};

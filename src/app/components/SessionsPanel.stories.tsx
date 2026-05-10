import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionsPanel, type SessionEntry } from "./SessionsPanel";

const meta: Meta<typeof SessionsPanel> = {
  title: "Components/SessionsPanel",
  component: SessionsPanel,
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof SessionsPanel>;

const sampleSessions: SessionEntry[] = [
  {
    id: "s1",
    name: "Upper Body Strength",
    occurredAt: new Date("2026-05-08"),
    energyRating: 4,
    painRating: 2,
    comment: "Felt strong today. Hit new PR on bench.",
    exercises: [
      {
        id: "e1",
        name: "Bench Press",
        type: "reps",
        sets: 4,
        reps: 8,
        weightLbs: 185,
        comment: null,
        videos: [],
      },
      {
        id: "e2",
        name: "Pull-Ups",
        type: "reps",
        sets: 3,
        reps: 10,
        weightLbs: null,
        comment: null,
        videos: [],
      },
    ],
  },
  {
    id: "s2",
    name: "Cardio + Core",
    occurredAt: new Date("2026-05-06"),
    energyRating: 3,
    painRating: 1,
    comment: null,
    exercises: [
      {
        id: "e3",
        name: "Plank Hold",
        type: "duration",
        sets: 3,
        durationSeconds: 60,
        weightLbs: null,
        comment: "Maintained form throughout",
        videos: [],
      },
    ],
  },
  {
    id: "s3",
    name: "Leg Day",
    occurredAt: new Date("2026-05-04"),
    energyRating: 5,
    painRating: 3,
    comment: null,
    exercises: [],
  },
];

export const WithSessions: Story = {
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <SessionsPanel sessions={sampleSessions} />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <SessionsPanel sessions={[]} />
    </div>
  ),
};

export const CyanAccent: Story = {
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <SessionsPanel sessions={sampleSessions} accentColor="#34FDFE" />
    </div>
  ),
};

export const WithCallbacks: Story = {
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <SessionsPanel
        sessions={sampleSessions}
        onNewSession={() => alert("New session clicked")}
        onEditSession={(s) => alert(`Edit: ${s.name}`)}
      />
    </div>
  ),
};

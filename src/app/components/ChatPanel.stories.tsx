import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChatPanel, type ChatMessage } from "./ChatPanel";

const meta: Meta<typeof ChatPanel> = {
  title: "Components/ChatPanel",
  component: ChatPanel,
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof ChatPanel>;

const trainer = { id: "trainer-1", name: "Alex Trainer", email: "alex@gym.com" };
const trainee = { id: "trainee-1", name: "Jamie Doe", email: "jamie@example.com" };

const sampleMessages: ChatMessage[] = [
  {
    id: "1",
    content: { text: "Hey Jamie! Great work on today's session." },
    createdAt: new Date(Date.now() - 1000 * 60 * 10),
    sender: trainer,
  },
  {
    id: "2",
    content: { text: "Thanks! Those squats were tough but I pushed through." },
    createdAt: new Date(Date.now() - 1000 * 60 * 8),
    sender: trainee,
  },
  {
    id: "3",
    content: { text: "Perfect. We'll add 5lbs next week. Keep up the hydration too!" },
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    sender: trainer,
  },
];

export const WithMessages: Story = {
  render: () => (
    <div style={{ width: 420, height: 500 }}>
      <ChatPanel
        initialMessages={sampleMessages}
        currentUserId={trainer.id}
        participant={trainee}
        onSend={async (text) => ({
          id: String(Date.now()),
          content: { text },
          createdAt: new Date(),
          sender: trainer,
        })}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => (
    <div style={{ width: 420, height: 500 }}>
      <ChatPanel
        initialMessages={[]}
        currentUserId={trainer.id}
        participant={trainee}
        onSend={async (text) => ({
          id: String(Date.now()),
          content: { text },
          createdAt: new Date(),
          sender: trainer,
        })}
      />
    </div>
  ),
};

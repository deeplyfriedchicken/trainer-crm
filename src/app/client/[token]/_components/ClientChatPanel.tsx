"use client";

import { type ChatMessage, ChatPanel } from "@/app/components/ChatPanel";
import { sendClientMessage } from "../actions";

type Props = {
  chatId: string;
  traineeId: string;
  initialMessages: ChatMessage[];
};

const FALLBACK_PARTICIPANT = {
  id: "coaching-team",
  name: "Coaching Team",
  email: "",
};

export function ClientChatPanel({ chatId, traineeId, initialMessages }: Props) {
  // Show the most recent non-self sender in the header. Falls back to a
  // generic label if no trainer has messaged yet.
  const latestTrainer = [...initialMessages]
    .reverse()
    .find((m) => m.sender.id !== traineeId)?.sender;
  const participant = latestTrainer ?? FALLBACK_PARTICIPANT;

  return (
    <ChatPanel
      initialMessages={initialMessages}
      currentUserId={traineeId}
      participant={participant}
      onSend={async (text) => {
        const msg = await sendClientMessage(chatId, text);
        return msg as ChatMessage;
      }}
    />
  );
}

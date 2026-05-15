"use client";

import { type ChatMessage, ChatPanel } from "@/app/components/ChatPanel";
import { fetchClientMessages, sendClientMessage } from "../actions";

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
  const latestTrainer = [...initialMessages]
    .reverse()
    .find((m) => m.sender.id !== traineeId)?.sender;
  const participant = latestTrainer ?? FALLBACK_PARTICIPANT;

  return (
    <ChatPanel
      initialMessages={initialMessages}
      currentUserId={traineeId}
      participant={participant}
      onFetchMessages={async () => {
        const msgs = await fetchClientMessages(chatId);
        return (msgs ?? []) as ChatMessage[];
      }}
      onSend={async (text) => {
        const msg = await sendClientMessage(chatId, text);
        return msg as ChatMessage;
      }}
    />
  );
}

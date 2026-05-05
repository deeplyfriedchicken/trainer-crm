"use client";

import { type ChatMessage, ChatPanel } from "@/app/components/ChatPanel";
import { sendClientMessage } from "../actions";

type Props = {
  chatId: string;
  traineeId: string;
  initialMessages: ChatMessage[];
  trainer: { id: string; name: string; email: string };
};

export function ClientChatPanel({
  chatId,
  traineeId,
  initialMessages,
  trainer,
}: Props) {
  return (
    <ChatPanel
      initialMessages={initialMessages}
      currentUserId={traineeId}
      participant={trainer}
      onSend={async (text) => {
        const msg = await sendClientMessage(chatId, text);
        return msg as ChatMessage;
      }}
    />
  );
}

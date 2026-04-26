"use client";

import { type ChatMessage, ChatPanel } from "@/app/components/ChatPanel";
import { sendMessage } from "../actions";

type Props = {
  chatId: string;
  initialMessages: ChatMessage[];
  currentUserId: string;
  participant: { id: string; name: string; email: string };
};

export function TraineeChatPanel({ chatId, ...rest }: Props) {
  return (
    <ChatPanel
      {...rest}
      onSend={async (text) => {
        const msg = await sendMessage(chatId, text);
        return msg as ChatMessage;
      }}
    />
  );
}

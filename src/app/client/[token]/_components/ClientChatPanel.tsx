"use client";

import { useState } from "react";
import { type ChatMessage, ChatPanel } from "@/app/components/ChatPanel";
import { fetchClientMessages, sendClientMessage } from "../actions";
import {
  PushPermissionPrompt,
  shouldShowPrompt,
} from "./PushPermissionPrompt";

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
  const [showPrompt, setShowPrompt] = useState(false);

  const latestTrainer = [...initialMessages]
    .reverse()
    .find((m) => m.sender.id !== traineeId)?.sender;
  const participant = latestTrainer ?? FALLBACK_PARTICIPANT;

  return (
    <>
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
          if (shouldShowPrompt()) setShowPrompt(true);
          return msg as ChatMessage;
        }}
      />
      {showPrompt && (
        <PushPermissionPrompt onDismiss={() => setShowPrompt(false)} />
      )}
    </>
  );
}

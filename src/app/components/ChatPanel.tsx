"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LuSend } from "react-icons/lu";
import { IconButton } from "./IconButton";
import styles from "./ChatPanel.module.css";

export type ChatMessage = {
  id: string;
  content: { text: string };
  createdAt: Date;
  sender: { id: string; name: string; email: string };
};

export type ChatParticipant = { id: string; name: string; email: string };

export type ColorVariant = "primary" | "secondary" | "tertiary";

const VARIANT_HEX: Record<ColorVariant, string> = {
  primary: "#fd6dbb",
  secondary: "#34fdfe",
  tertiary: "#4ade80",
};

const AVATAR_COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB",
  B: "#34FDFE",
  C: "#a78bfa",
  D: "#4ade80",
  E: "#fb923c",
  F: "#FD6DBB",
  G: "#34FDFE",
  H: "#a78bfa",
  I: "#4ade80",
  J: "#FD6DBB",
  K: "#34FDFE",
  L: "#a78bfa",
  M: "#4ade80",
  N: "#fb923c",
  O: "#FD6DBB",
  P: "#34FDFE",
  Q: "#a78bfa",
  R: "#4ade80",
  S: "#FD6DBB",
  T: "#34FDFE",
  U: "#a78bfa",
  V: "#4ade80",
  W: "#fb923c",
  X: "#FD6DBB",
  Y: "#34FDFE",
  Z: "#a78bfa",
};
function avatarColor(name: string) {
  return AVATAR_COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const POLL_INTERVAL_MS = 15_000;

export function ChatPanel({
  initialMessages,
  currentUserId,
  participant,
  colorVariant = "primary",
  onSend,
  onFetchMessages,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  participant: ChatParticipant;
  colorVariant?: ColorVariant;
  onSend: (text: string) => Promise<ChatMessage>;
  onFetchMessages?: () => Promise<ChatMessage[]>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const primaryHex = VARIANT_HEX[colorVariant];
  const participantColor = avatarColor(participant.name);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    if (!onFetchMessages) return;
    const interval = setInterval(async () => {
      if (document.visibilityState === "hidden") return;
      try {
        const fresh = await onFetchMessages();
        setMessages((prev) => {
          const knownIds = new Set(prev.map((m) => m.id));
          const newOnes = fresh.filter((m) => !knownIds.has(m.id));
          return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
        });
      } catch {
        // Polling failures are silent
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [onFetchMessages]);

  function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput("");
    startTransition(async () => {
      const saved = await onSend(text);
      setMessages((prev) => [...prev, saved]);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `${participantColor}22`,
            border: `1.5px solid ${participantColor}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: participantColor,
            flexShrink: 0,
          }}
        >
          {participant.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className={styles.headerName}>{participant.name}</div>
          <div className={styles.headerStatus}>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--color-tertiary)",
                boxShadow: "0 0 5px var(--color-tertiary)",
              }}
            />
            Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messages} ref={scrollRef}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>No messages yet. Say hello!</div>
        )}

        {messages.map((m) => {
          const isMe = m.sender.id === currentUserId;
          const senderHex = isMe ? primaryHex : avatarColor(m.sender.name);

          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: isMe ? "row" : "row-reverse",
                gap: 8,
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: `${senderHex}22`,
                  border: `1.5px solid ${senderHex}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: senderHex,
                  flexShrink: 0,
                }}
              >
                {m.sender.name[0]?.toUpperCase()}
              </div>
              <div style={{ maxWidth: "75%" }}>
                <div
                  className={styles.messageMeta}
                  style={{ textAlign: isMe ? "left" : "right" }}
                >
                  {m.sender.name} · {formatTime(m.createdAt)}
                </div>
                <div
                  style={{
                    background: `${senderHex}1a`,
                    border: `1px solid ${senderHex}4d`,
                    borderRadius: isMe
                      ? "4px 12px 12px 12px"
                      : "12px 4px 12px 12px",
                    padding: "9px 12px",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.85)",
                    lineHeight: 1.5,
                  }}
                >
                  {m.content.text}
                </div>
              </div>
            </div>
          );
        })}

        {isPending && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 8,
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: `${primaryHex}26`,
                border: `1.5px solid ${primaryHex}8c`,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                background: `${primaryHex}14`,
                border: `1px solid ${primaryHex}33`,
                borderRadius: "4px 12px 12px 12px",
                padding: "9px 14px",
                color: "rgba(255,255,255,0.3)",
                fontSize: 18,
                letterSpacing: 2,
              }}
            >
              ···
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message…"
          disabled={isPending}
        />
        <IconButton
          variant="solid"
          colorScheme="pink"
          size="md"
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          aria-label="Send message"
        >
          <LuSend size={14} color="#1a0010" />
        </IconButton>
      </div>
    </div>
  );
}

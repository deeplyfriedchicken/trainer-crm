"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LuSend } from "react-icons/lu";
import styles from "./ChatPanel.module.css";

export type ChatMessage = {
  id: string;
  content: { text: string };
  createdAt: Date;
  sender: { id: string; name: string; email: string };
};

export type ChatParticipant = { id: string; name: string; email: string };

const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB", B: "#34FDFE", C: "#a78bfa", D: "#4ade80", E: "#fb923c",
  F: "#FD6DBB", G: "#34FDFE", H: "#a78bfa", I: "#4ade80", J: "#FD6DBB",
  K: "#34FDFE", L: "#a78bfa", M: "#4ade80", N: "#fb923c", O: "#FD6DBB",
  P: "#34FDFE", Q: "#a78bfa", R: "#4ade80", S: "#FD6DBB", T: "#34FDFE",
  U: "#a78bfa", V: "#4ade80", W: "#fb923c", X: "#FD6DBB", Y: "#34FDFE",
  Z: "#a78bfa",
};
function colorFor(name: string) {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

function formatTime(d: Date) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function ChatPanel({
  initialMessages,
  currentUserId,
  participant,
  onSend,
}: {
  initialMessages: ChatMessage[];
  currentUserId: string;
  participant: ChatParticipant;
  onSend: (text: string) => Promise<ChatMessage>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const participantColor = colorFor(participant.name);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
            width: 32, height: 32, borderRadius: "50%",
            background: `${participantColor}22`,
            border: `1.5px solid ${participantColor}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: participantColor, flexShrink: 0,
          }}
        >
          {participant.name[0]?.toUpperCase()}
        </div>
        <div>
          <div className={styles.headerName}>{participant.name}</div>
          <div className={styles.headerStatus}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 5px #4ade80" }} />
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
          const senderColor = isMe ? "var(--neon-pink)" : colorFor(m.sender.name);

          return (
            <div
              key={m.id}
              style={{ display: "flex", flexDirection: isMe ? "row" : "row-reverse", gap: 8, alignItems: "flex-end" }}
            >
              <div
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: isMe ? "rgba(253,109,187,0.15)" : `${colorFor(m.sender.name)}22`,
                  border: `1.5px solid ${senderColor}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: senderColor, flexShrink: 0,
                }}
              >
                {m.sender.name[0]?.toUpperCase()}
              </div>
              <div style={{ maxWidth: "75%" }}>
                <div className={styles.messageMeta} style={{ textAlign: isMe ? "left" : "right" }}>
                  {m.sender.name} · {formatTime(m.createdAt)}
                </div>
                <div
                  style={{
                    background: isMe ? "rgba(253,109,187,0.1)" : `${colorFor(m.sender.name)}18`,
                    border: `1px solid ${isMe ? "rgba(253,109,187,0.3)" : `${colorFor(m.sender.name)}33`}`,
                    borderRadius: isMe ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                    padding: "9px 12px", fontSize: 13,
                    color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
                  }}
                >
                  {m.content.text}
                </div>
              </div>
            </div>
          );
        })}

        {isPending && (
          <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "flex-end" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(253,109,187,0.15)", border: "1.5px solid rgba(253,109,187,0.55)", flexShrink: 0 }} />
            <div style={{ background: "rgba(253,109,187,0.08)", border: "1px solid rgba(253,109,187,0.2)", borderRadius: "4px 12px 12px 12px", padding: "9px 14px", color: "rgba(255,255,255,0.3)", fontSize: 18, letterSpacing: 2 }}>
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
        <button
          type="button"
          className={styles.sendBtn}
          onClick={handleSend}
          disabled={isPending || !input.trim()}
          aria-label="Send message"
        >
          <LuSend size={14} color="#1a0010" />
        </button>
      </div>
    </div>
  );
}

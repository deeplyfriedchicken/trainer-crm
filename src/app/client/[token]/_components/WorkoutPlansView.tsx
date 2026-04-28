"use client";

import Link from "next/link";
import { useState } from "react";
import type { ClientData } from "@/db/queries/client";

function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11l4-4-4-4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2.5" width="9" height="9" rx="1.5" />
      <path d="M10 5.5l3-2v7l-3-2" />
    </svg>
  );
}

type Session = ClientData["coachingSessions"][number];

function PlanCard({ session, token }: { session: Session; token: string }) {
  const [open, setOpen] = useState(false);
  const date = new Date(session.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="client-card">
      <div className="plan-header" onClick={() => setOpen((o) => !o)}>
        <div className="plan-dot" />
        <div style={{ flex: 1 }}>
          <div className="plan-name">{date}</div>
          <div className="plan-meta">{session.exercises.length} exercise{session.exercises.length !== 1 ? "s" : ""}</div>
        </div>
        <div className={`plan-chevron${open ? " open" : ""}`}>
          <ChevronDown />
        </div>
      </div>
      {open && (
        <div className="plan-exercises">
          {session.exercises.map((ex) => (
            <Link
              key={ex.id}
              href={`/client/${token}/exercise/${ex.id}`}
              className="exercise-row"
            >
              <span className="ex-name">{ex.name}</span>
              {ex.videoLinks.length > 0 && (
                <span className="ex-tag has-video">
                  <VideoIcon /> Video
                </span>
              )}
              <span className="ex-tag">
                {ex.sets}×{ex.reps}
              </span>
              <span className="ex-arrow">
                <ArrowRight />
              </span>
            </Link>
          ))}
          <div className="plan-actions" />
        </div>
      )}
    </div>
  );
}

function HistoryCard({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const date = new Date(session.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="history-card">
      <div
        style={{ padding: 16, cursor: "pointer", userSelect: "none" }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="history-top">
          <div>
            <div className="history-name">{date}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="history-badge">
              {session.exercises.length} exercise{session.exercises.length !== 1 ? "s" : ""}
            </span>
            <span
              style={{
                color: "var(--text-3)",
                transition: "transform 0.2s",
                display: "inline-flex",
                transform: open ? "rotate(180deg)" : "none",
              }}
            >
              <ChevronDown />
            </span>
          </div>
        </div>
        {(session.comment || session.painRating || session.energyRating) && (
          <div className="history-feedback">
            {session.comment && (
              <div className="history-comment">"{session.comment}"</div>
            )}
            <div className="scales-row">
              {session.painRating != null && (
                <span className="scale-badge scale-pain">
                  Pain {session.painRating}/5
                </span>
              )}
              {session.energyRating != null && (
                <span className="scale-badge scale-energy">
                  Energy {session.energyRating}/5
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {session.exercises.map((ex, exIdx) => (
            <div
              key={ex.id}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <div
                style={{
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--surface2)",
                }}
              >
                <div
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "rgba(253,109,187,0.15)", color: "var(--pink)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, flexShrink: 0,
                  }}
                >
                  {exIdx + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{ex.name}</div>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>
                  {ex.sets}×{ex.reps}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  trainee: { name: string; email: string };
  sessions: ClientData["coachingSessions"];
  token: string;
}

export function WorkoutPlansView({ trainee, sessions, token }: Props) {
  const [tab, setTab] = useState<"plans" | "history">("plans");

  const plans = sessions.filter((s) => !s.completed);
  const history = sessions.filter((s) => s.completed === true);

  const initials = trainee.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="client-page">
      <div className="client-topbar">
        <div className="client-topbar-inner">
          <div className="client-topbar-title">{trainee.name}</div>
          <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Trainee</span>
        </div>
      </div>

      <div className="client-inner">
        <div className="client-header">
          <div className="client-header-row">
            <div className="client-avatar">
              <div className="client-avatar-inner">{initials}</div>
            </div>
            <div className="client-info">
              <div className="client-name">{trainee.name}</div>
              <div className="client-meta">
                {plans.length} active plan{plans.length !== 1 ? "s" : ""} · {history.length} completed
              </div>
            </div>
          </div>
        </div>

        <div className="client-tabs">
          <button
            className={`client-tab${tab === "plans" ? " active" : ""}`}
            onClick={() => setTab("plans")}
            type="button"
          >
            My Plans
          </button>
          <button
            className={`client-tab${tab === "history" ? " active" : ""}`}
            onClick={() => setTab("history")}
            type="button"
          >
            History{history.length > 0 ? ` (${history.length})` : ""}
          </button>
        </div>

        {tab === "plans" ? (
          <div>
            {plans.length === 0 ? (
              <div className="client-empty">
                <div className="client-empty-icon">📋</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No workout plans yet</div>
                <div>Your trainer will assign plans here.</div>
              </div>
            ) : (
              plans.map((s) => <PlanCard key={s.id} session={s} token={token} />)
            )}
            <div style={{ height: 60 }} />
          </div>
        ) : (
          <div>
            {history.length === 0 ? (
              <div className="client-empty">
                <div className="client-empty-icon">🏆</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>No completed sessions yet</div>
                <div>Completed sessions will appear here.</div>
              </div>
            ) : (
              history.map((s) => <HistoryCard key={s.id} session={s} />)
            )}
            <div style={{ height: 60 }} />
          </div>
        )}
      </div>
    </div>
  );
}

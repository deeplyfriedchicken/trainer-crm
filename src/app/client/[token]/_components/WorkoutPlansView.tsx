"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LuChevronDown, LuChevronRight, LuPlus, LuVideo } from "react-icons/lu";
import { Badge } from "@/app/components/Badge";
import { BottomSheet } from "@/app/components/BottomSheet";
import { Button } from "@/app/components/Button";
import { Tab, TabGroup } from "@/app/components/TabGroup";
import type { ClientChat, ClientData } from "@/db/queries/client";
import { ClientChatPanel } from "./ClientChatPanel";
import { PushPermissionPrompt, shouldShowPrompt } from "./PushPermissionPrompt";

type Plan = ClientData["workoutPlans"][number];
type Workout = ClientData["workouts"][number];

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function PlanCard({
  plan,
  token,
  open,
  onToggle,
  backParam,
}: {
  plan: Plan;
  token: string;
  open: boolean;
  onToggle: () => void;
  backParam: string;
}) {
  const back = backParam ? `?back=${encodeURIComponent(backParam)}` : "";
  return (
    <div className="client-card">
      <button type="button" className="plan-header" onClick={onToggle}>
        <div className="plan-dot" />
        <div style={{ flex: 1 }}>
          <div className="plan-name">{plan.name}</div>
          <div className="plan-meta">
            {fmtDate(plan.occurredAt)} · {plan.exercises.length} exercise
            {plan.exercises.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className={`plan-chevron${open ? " open" : ""}`}>
          <LuChevronDown size={16} />
        </div>
      </button>

      {open && (
        <div className="plan-exercises">
          {plan.exercises.map((ex) => (
            <Link
              key={ex.id}
              href={`/client/${token}/exercise/${ex.id}${back}`}
              className="exercise-row"
            >
              <span className="ex-name">{ex.name}</span>
              {ex.videoLinks.length > 0 && (
                <Badge colorScheme="pink" variant="subtle">
                  <LuVideo size={10} /> Video
                </Badge>
              )}
              <Badge colorScheme="cyan" variant="subtle">
                {ex.type === "duration"
                  ? `${ex.sets}×${ex.durationSeconds}s`
                  : `${ex.sets}×${ex.reps}`}
              </Badge>
              {ex.weightLbs && (
                <span className="ex-weight">@ {ex.weightLbs}lbs</span>
              )}
              <span className="ex-arrow">
                <LuChevronRight size={14} />
              </span>
            </Link>
          ))}
          <div className="plan-actions">
            <Link
              href={`/client/${token}/log/${plan.id}${back}`}
              style={{ display: "block" }}
            >
              <Button variant="solid" colorScheme="pink" size="sm" w="100%">
                Start Workout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryCard({ workout }: { workout: Workout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="history-card">
      <button
        type="button"
        style={{
          width: "100%",
          padding: 16,
          cursor: "pointer",
          userSelect: "none",
          background: "none",
          border: "none",
          color: "inherit",
          font: "inherit",
          textAlign: "left",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="history-top">
          <div>
            <div className="history-name">
              {workout.workoutPlan?.name ?? fmtDate(workout.createdAt)}
            </div>
            <div className="history-date">{fmtDate(workout.createdAt)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge colorScheme="cyan" variant="subtle">
              {fmtDuration(workout.durationSeconds)}
            </Badge>
            <span
              style={{
                color: "var(--text-3)",
                display: "inline-flex",
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <LuChevronDown size={16} />
            </span>
          </div>
        </div>
        {(workout.comment || workout.painRating || workout.energyRating) && (
          <div className="history-feedback">
            {workout.comment && (
              <div className="history-comment">"{workout.comment}"</div>
            )}
            <div className="scales-row">
              {workout.painRating != null && (
                <Badge colorScheme="red" variant="subtle">
                  Pain {workout.painRating}/10
                </Badge>
              )}
              {workout.energyRating != null && (
                <Badge colorScheme="pink" variant="subtle">
                  Energy {workout.energyRating}/10
                </Badge>
              )}
            </div>
          </div>
        )}
      </button>

      {open && workout.exerciseLinks.length > 0 && (
        <div className="history-exercises">
          {workout.exerciseLinks.map(({ exercise, setsData }) => (
            <div key={exercise.id} className="history-ex-card">
              <div className="history-ex-card-name">{exercise.name}</div>
              <div className="history-ex-set-rows">
                {setsData && setsData.length > 0 ? (
                  setsData.map((s, i) => {
                    const isDur = s.durationSeconds != null;
                    return (
                      <div
                        // biome-ignore lint/suspicious/noArrayIndexKey: setsData items are raw JSONB with no stable ID; this list is read-only and never reordered
                        key={i}
                        className={`history-ex-set-row${!s.completed ? " skipped" : ""}`}
                      >
                        <span className="history-ex-set-label">
                          SET {i + 1}
                        </span>
                        <span className="history-ex-set-val">
                          {isDur ? s.durationSeconds : s.reps}
                          <span className="history-ex-set-unit">
                            {isDur ? "SEC" : "REPS"}
                          </span>
                        </span>
                        <span className="history-ex-set-weight">
                          {s.weightLbs ? `${s.weightLbs} lbs` : "—"}
                        </span>
                        {s.completed ? (
                          <span className="history-ex-set-check">✓</span>
                        ) : (
                          <span className="history-ex-set-skip">✕</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="history-ex-set-row">
                    <span className="history-ex-set-label">PLAN</span>
                    <span className="history-ex-set-val">
                      {exercise.type === "duration"
                        ? exercise.durationSeconds
                        : exercise.reps}
                      <span className="history-ex-set-unit">
                        {exercise.type === "duration" ? "SEC" : "REPS"}
                      </span>
                    </span>
                    <span className="history-ex-set-weight">
                      {exercise.sets} sets
                    </span>
                    <span />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  trainee: { id: string; name: string; email: string };
  workoutPlans: Plan[];
  workouts: Workout[];
  token: string;
  chat: ClientChat | null;
}

export function WorkoutPlansView({
  trainee,
  workoutPlans,
  workouts,
  token,
  chat,
}: Props) {
  const [showPrompt, setShowPrompt] = useState(shouldShowPrompt());
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tab =
    (searchParams.get("tab") as "plans" | "history" | "chat") ?? "plans";
  const openIds = new Set(
    searchParams.get("open")?.split(",").filter(Boolean) ?? [],
  );
  const [showChoosePlan, setShowChoosePlan] = useState(false);

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  function setTab(newTab: "plans" | "history" | "chat") {
    updateParams({ tab: newTab });
  }

  function togglePlan(planId: string) {
    const next = new Set(openIds);
    if (next.has(planId)) next.delete(planId);
    else next.add(planId);
    updateParams({ open: next.size > 0 ? [...next].join(",") : null });
  }

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
          <span
            style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}
          >
            Trainee
          </span>
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
                {workoutPlans.length} plan{workoutPlans.length !== 1 ? "s" : ""}{" "}
                · {workouts.length} completed
              </div>
            </div>
          </div>
        </div>

        <TabGroup colorScheme="pink" style={{ marginBottom: 20 }}>
          <Tab
            active={tab === "plans"}
            colorScheme="pink"
            onClick={() => setTab("plans")}
          >
            My Plans
          </Tab>
          <Tab
            active={tab === "history"}
            colorScheme="pink"
            onClick={() => setTab("history")}
          >
            History{workouts.length > 0 ? ` (${workouts.length})` : ""}
          </Tab>
          {chat && (
            <Tab
              active={tab === "chat"}
              colorScheme="pink"
              onClick={() => setTab("chat")}
            >
              Chat
            </Tab>
          )}
        </TabGroup>

        {tab === "plans" && (
          <div>
            {workoutPlans.length === 0 ? (
              <div className="client-empty">
                <div className="client-empty-icon">📋</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  No workout plans yet
                </div>
                <div>Your trainer will assign plans here.</div>
              </div>
            ) : (
              workoutPlans.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  token={token}
                  open={openIds.has(p.id)}
                  onToggle={() => togglePlan(p.id)}
                  backParam={searchParams.toString()}
                />
              ))
            )}
            <div style={{ height: 100 }} />
          </div>
        )}

        {tab === "history" && (
          <div>
            {workouts.length === 0 ? (
              <div className="client-empty">
                <div className="client-empty-icon">🏆</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  No workouts logged yet
                </div>
                <div>Tap + to log your first workout.</div>
              </div>
            ) : (
              workouts.map((w) => <HistoryCard key={w.id} workout={w} />)
            )}
            <div style={{ height: 60 }} />
          </div>
        )}

        {tab === "chat" && chat && (
          <ClientChatPanel
            chatId={chat.id}
            traineeId={trainee.id}
            initialMessages={chat.messages}
          />
        )}
      </div>

      {tab !== "chat" && (
        <button
          className="fab"
          onClick={() => setShowChoosePlan(true)}
          type="button"
          title="Log Workout"
        >
          <LuPlus size={24} strokeWidth={2.5} />
        </button>
      )}

      {showChoosePlan && (
        <BottomSheet
          onClose={() => setShowChoosePlan(false)}
          title="Choose a Workout Plan"
        >
          {workoutPlans.length === 0 ? (
            <div
              style={{
                padding: "20px 16px",
                color: "var(--color-text-muted)",
                fontSize: 14,
              }}
            >
              No plans available. Your trainer will assign plans here.
            </div>
          ) : (
            workoutPlans.map((p) => (
              <button
                key={p.id}
                type="button"
                className="sheet-plan-row"
                onClick={() => {
                  setShowChoosePlan(false);
                  const back = searchParams.toString();
                  const q = back ? `?back=${encodeURIComponent(back)}` : "";
                  router.push(`/client/${token}/log/${p.id}${q}`);
                }}
              >
                <div className="sheet-plan-dot" />
                <div style={{ flex: 1 }}>
                  <div className="sheet-plan-name">{p.name}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--color-text-dim)",
                      marginTop: 2,
                    }}
                  >
                    {fmtDate(p.occurredAt)}
                  </div>
                </div>
                <span className="sheet-plan-count">
                  {p.exercises.length} exercise
                  {p.exercises.length !== 1 ? "s" : ""}
                </span>
                <span style={{ color: "var(--color-text-dim)", marginLeft: 8 }}>
                  <LuChevronRight size={14} />
                </span>
              </button>
            ))
          )}
          <div style={{ height: 16 }} />
        </BottomSheet>
      )}
      {showPrompt && (
        <PushPermissionPrompt onDismiss={() => setShowPrompt(false)} />
      )}
    </div>
  );
}

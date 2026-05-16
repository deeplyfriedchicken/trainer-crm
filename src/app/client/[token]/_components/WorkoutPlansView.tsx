"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LuChevronDown,
  LuChevronRight,
  LuClock,
  LuDumbbell,
  LuPlus,
  LuVideo,
  LuWeight,
} from "react-icons/lu";
import { Badge } from "@/app/components/Badge";
import { BottomSheet } from "@/app/components/BottomSheet";
import { Button } from "@/app/components/Button";
import { Tab, TabGroup } from "@/app/components/TabGroup";
import type { ClientChat, ClientData } from "@/db/queries/client";
import { ClientChatPanel } from "./ClientChatPanel";
import { InstallGuideSheet } from "./InstallGuideSheet";
import { isPwa, PushPermissionPrompt, shouldShowPrompt } from "./PushPermissionPrompt";

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

type SetMeta = { cancelled?: boolean; wasPaused?: boolean } | null | unknown;

function getSetStatus(
  completed: boolean,
  meta: SetMeta,
): "done" | "donePaused" | "cancelled" | "pending" {
  const m = meta as { cancelled?: boolean; wasPaused?: boolean } | null;
  if (completed && m?.wasPaused) return "donePaused";
  if (completed) return "done";
  if (m?.cancelled) return "cancelled";
  return "pending";
}

function SetCheck({ status }: { status: ReturnType<typeof getSetStatus> }) {
  if (status === "done") {
    return (
      <span className="history-ex-set-check">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6l3 3 5-5" />
        </svg>
      </span>
    );
  }
  if (status === "donePaused") {
    return (
      <span className="history-ex-set-check paused">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6l3 3 5-5" />
        </svg>
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="history-ex-set-cancel">
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
        </svg>
      </span>
    );
  }
  return <span className="history-ex-set-skip">—</span>;
}

function HistoryCard({ workout }: { workout: Workout }) {
  const [open, setOpen] = useState(false);

  // Compute stats from sets
  const allSets = workout.sets ?? [];
  const completedSets = allSets.filter((s) => s.completed).length;
  const totalSets = allSets.length;
  const totalVolume = allSets.reduce((acc, s) => {
    if (!s.completed) return acc;
    const reps = s.reps ?? 0;
    const weight = s.weightLbs ?? 0;
    return acc + reps * weight;
  }, 0);
  const volumeLabel =
    totalVolume >= 1000
      ? `${(totalVolume / 1000).toFixed(totalVolume >= 10000 ? 0 : 1)}k lbs`
      : totalVolume > 0
        ? `${Math.round(totalVolume)} lbs`
        : null;

  // Group sets by exerciseId for the expanded view
  const setsByExercise = new Map<string, typeof allSets>();
  for (const s of allSets) {
    const arr = setsByExercise.get(s.exerciseId) ?? [];
    arr.push(s);
    setsByExercise.set(s.exerciseId, arr);
  }

  const hasFeedback =
    workout.comment ||
    workout.painRating != null ||
    workout.postSessionEnergy != null ||
    workout.preSessionEnergy != null ||
    workout.preSessionStress != null ||
    workout.preSessionSoreness != null;

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
            {totalSets > 0 && (
              <Badge colorScheme="cyan" variant="subtle">
                {completedSets}/{totalSets} sets
              </Badge>
            )}
            <span
              style={{
                color: "var(--color-text-dim)",
                display: "inline-flex",
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <LuChevronDown size={16} />
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="history-stats">
          <span className="history-stat">
            <LuClock size={13} style={{ opacity: 0.6 }} />
            <strong>{fmtDuration(workout.durationSeconds)}</strong>
          </span>
          {totalSets > 0 && (
            <span className="history-stat">
              <LuDumbbell size={13} style={{ opacity: 0.6 }} />
              <strong>
                {completedSets}/{totalSets}
              </strong>
              <span
                style={{
                  color: "var(--color-text-dim)",
                  fontSize: 11,
                  marginLeft: 1,
                }}
              >
                sets
              </span>
            </span>
          )}
          {volumeLabel && (
            <span className="history-stat">
              <LuWeight size={13} style={{ opacity: 0.6 }} />
              <strong>{volumeLabel}</strong>
              <span
                style={{
                  color: "var(--color-text-dim)",
                  fontSize: 11,
                  marginLeft: 1,
                }}
              >
                volume
              </span>
            </span>
          )}
        </div>

        {/* Feedback summary */}
        {hasFeedback && (
          <div className="history-feedback">
            {workout.comment && (
              <div className="history-comment">"{workout.comment}"</div>
            )}
            {(workout.preSessionEnergy != null ||
              workout.preSessionStress != null ||
              workout.preSessionSoreness != null) && (
              <>
                <div className="history-session-label">Pre-session</div>
                <div className="scales-row">
                  {workout.preSessionEnergy != null && (
                    <span
                      className="scale-badge"
                      style={{
                        background: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.28)",
                      }}
                    >
                      Energy {workout.preSessionEnergy}/10
                    </span>
                  )}
                  {workout.preSessionStress != null && (
                    <span
                      className="scale-badge"
                      style={{
                        background: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.28)",
                      }}
                    >
                      Stress {workout.preSessionStress}/10
                    </span>
                  )}
                  {workout.preSessionSoreness != null && (
                    <span
                      className="scale-badge"
                      style={{
                        background: "rgba(167,139,250,0.12)",
                        color: "#a78bfa",
                        border: "1px solid rgba(167,139,250,0.28)",
                      }}
                    >
                      Soreness {workout.preSessionSoreness}/10
                    </span>
                  )}
                </div>
              </>
            )}
            {(workout.painRating != null ||
              workout.postSessionEnergy != null) && (
              <>
                <div className="history-session-label" style={{ marginTop: 8 }}>
                  Post-session
                </div>
                <div className="scales-row">
                  {workout.painRating != null && (
                    <Badge colorScheme="red" variant="subtle">
                      Pain {workout.painRating}/10
                    </Badge>
                  )}
                  {workout.postSessionEnergy != null && (
                    <Badge colorScheme="pink" variant="subtle">
                      Energy {workout.postSessionEnergy}/10
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </button>

      {open && (
        <div className="history-exercises">
          {workout.exerciseLinks.map(({ exercise }) => {
            const exSets = (setsByExercise.get(exercise.id) ?? []).filter(
              (s) => s.completed || (s.metadata as SetMeta as { cancelled?: boolean })?.cancelled,
            );
            return (
              <div key={exercise.id} className="history-ex-card">
                <div className="history-ex-card-name">{exercise.name}</div>
                <div className="history-ex-set-rows">
                  {exSets.length === 0 ? (
                    <div
                      style={{
                        padding: "8px 10px",
                        fontSize: 11,
                        color: "var(--color-text-dim)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      No sets completed
                    </div>
                  ) : (
                    exSets.map((s) => {
                      const status = getSetStatus(s.completed, s.metadata);
                      const unit =
                        exercise.type === "duration" ? "SEC" : "REPS";
                      const val =
                        exercise.type === "duration"
                          ? s.durationSeconds
                          : s.reps;
                      return (
                        <div
                          key={s.id}
                          className={`history-ex-set-row${status === "cancelled" ? " cancelled" : ""}`}
                        >
                          <span className="history-ex-set-label">
                            SET {s.position + 1}
                          </span>
                          <span className="history-ex-set-val">
                            {val ?? "—"}
                            <span className="history-ex-set-unit"> {unit}</span>
                          </span>
                          <span className="history-ex-set-weight">
                            {s.weightLbs != null && s.weightLbs > 0
                              ? `${s.weightLbs} lbs`
                              : ""}
                          </span>
                          <SetCheck status={status} />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
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
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (sessionStorage.getItem("show-install-guide") === "1") {
      sessionStorage.removeItem("show-install-guide");
      if (!isPwa()) setShowInstallGuide(true);
    }
  }, []);
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
      {showInstallGuide && (
        <InstallGuideSheet onClose={() => setShowInstallGuide(false)} />
      )}
      {showPrompt && (
        <PushPermissionPrompt onDismiss={() => setShowPrompt(false)} />
      )}
    </div>
  );
}

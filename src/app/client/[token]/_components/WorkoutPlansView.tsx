"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ClientData } from "@/db/queries/client";

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 11l4-4-4-4" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="2.5" width="9" height="9" rx="1.5" />
      <path d="M10 5.5l3-2v7l-3-2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

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

function PlanCard({ plan, token }: { plan: Plan; token: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="client-card">
      <div className="plan-header" onClick={() => setOpen((o) => !o)}>
        <div className="plan-dot" />
        <div style={{ flex: 1 }}>
          <div className="plan-name">{plan.name}</div>
          <div className="plan-meta">
            {fmtDate(plan.occurredAt)} · {plan.exercises.length} exercise
            {plan.exercises.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className={`plan-chevron${open ? " open" : ""}`}>
          <ChevronDown />
        </div>
      </div>

      {open && (
        <div className="plan-exercises">
          {plan.exercises.map((ex) => (
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
                {ex.type === "duration"
                  ? `${ex.sets}×${ex.durationSeconds}s`
                  : `${ex.sets}×${ex.reps}`}
              </span>
              <span className="ex-arrow">
                <ArrowRight />
              </span>
            </Link>
          ))}
          <div className="plan-actions">
            <Link
              href={`/client/${token}/log/${plan.id}`}
              className="client-btn client-btn-primary client-btn-sm"
            >
              Start Workout
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
      <div
        style={{ padding: 16, cursor: "pointer", userSelect: "none" }}
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
            <span className="history-badge">
              {fmtDuration(workout.durationSeconds)}
            </span>
            <span
              style={{
                color: "var(--text-3)",
                display: "inline-flex",
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              <ChevronDown />
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
                <span className="scale-badge scale-pain">
                  Pain {workout.painRating}/10
                </span>
              )}
              {workout.energyRating != null && (
                <span className="scale-badge scale-energy">
                  Energy {workout.energyRating}/10
                </span>
              )}
            </div>
          </div>
        )}
      </div>

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

function ChoosePlanSheet({
  plans,
  token,
  onClose,
}: {
  plans: Plan[];
  token: string;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">Choose a Workout Plan</div>
        {plans.length === 0 ? (
          <div
            style={{
              padding: "20px 16px",
              color: "var(--text-3)",
              fontSize: 14,
            }}
          >
            No plans available. Your trainer will assign plans here.
          </div>
        ) : (
          plans.map((p) => (
            <div
              key={p.id}
              className="sheet-plan-row"
              onClick={() => {
                onClose();
                router.push(`/client/${token}/log/${p.id}`);
              }}
            >
              <div className="sheet-plan-dot" />
              <div style={{ flex: 1 }}>
                <div className="sheet-plan-name">{p.name}</div>
                <div
                  style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}
                >
                  {fmtDate(p.occurredAt)}
                </div>
              </div>
              <span className="sheet-plan-count">
                {p.exercises.length} exercise
                {p.exercises.length !== 1 ? "s" : ""}
              </span>
              <span style={{ color: "var(--text-3)", marginLeft: 8 }}>
                <ArrowRight />
              </span>
            </div>
          ))
        )}
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}

interface Props {
  trainee: { name: string; email: string };
  workoutPlans: Plan[];
  workouts: Workout[];
  token: string;
}

export function WorkoutPlansView({
  trainee,
  workoutPlans,
  workouts,
  token,
}: Props) {
  const [tab, setTab] = useState<"plans" | "history">("plans");
  const [showChoosePlan, setShowChoosePlan] = useState(false);

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
            History{workouts.length > 0 ? ` (${workouts.length})` : ""}
          </button>
        </div>

        {tab === "plans" ? (
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
                <PlanCard key={p.id} plan={p} token={token} />
              ))
            )}
            <div style={{ height: 100 }} />
          </div>
        ) : (
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
      </div>

      <button
        className="fab"
        onClick={() => setShowChoosePlan(true)}
        type="button"
        title="Log Workout"
      >
        <PlusIcon />
      </button>

      {showChoosePlan && (
        <ChoosePlanSheet
          plans={workoutPlans}
          token={token}
          onClose={() => setShowChoosePlan(false)}
        />
      )}
    </div>
  );
}

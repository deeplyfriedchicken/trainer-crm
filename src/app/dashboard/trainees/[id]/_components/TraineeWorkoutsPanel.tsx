"use client";

import { useOptimistic, useTransition } from "react";
import { LuDumbbell } from "react-icons/lu";
import { updateSessionQuality } from "../actions";

type WorkoutSet = {
  exerciseId: string;
  completed: boolean;
  weightLbs: number | null;
  reps: number | null;
  durationSeconds: number | null;
  position: number;
};

type WorkoutExerciseLink = {
  exercise: {
    id: string;
    name: string;
    type: "reps" | "duration";
    sets: number;
    reps: number | null;
    durationSeconds: number | null;
    weightLbs: number | null;
  };
};

export type WorkoutPanelEntry = {
  id: string;
  createdAt: Date;
  durationSeconds: number;
  preSessionEnergy: number | null;
  preSessionSoreness: number | null;
  preSessionStress: number | null;
  postSessionEnergy: number | null;
  sessionQuality: number | null;
  adherencePercent: number | null;
  comment: string | null;
  workoutPlan: { id: string; name: string; occurredAt: Date } | null;
  exerciseLinks: WorkoutExerciseLink[];
  sets: WorkoutSet[];
};

const CYAN = "#34fdfe";
const PINK = "#fd6dbb";

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtRel(d: Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const dy = Math.floor(diff / 86400000);
  if (dy === 0) return "today";
  if (dy === 1) return "yesterday";
  if (dy < 7) return `${dy} days ago`;
  const wk = Math.floor(dy / 7);
  if (wk < 5) return `${wk}w ago`;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function scoreColor(n: number, inverted: boolean): string {
  const bad = inverted ? n >= 7 : n <= 3;
  const mid = n >= 4 && n <= 6;
  if (bad) return "#f87171";
  if (mid) return "#fbbf24";
  return "#4ade80";
}

function WorkoutCard({
  workout,
  accentColor,
  traineeId,
}: {
  workout: WorkoutPanelEntry;
  accentColor: string;
  traineeId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useOptimistic(workout.sessionQuality);

  function handleRatingClick(n: number) {
    startTransition(async () => {
      setRating(n);
      await updateSessionQuality(workout.id, n, traineeId);
    });
  }

  const setsByExercise = new Map<string, WorkoutSet[]>();
  for (const s of workout.sets) {
    const arr = setsByExercise.get(s.exerciseId) ?? [];
    arr.push(s);
    setsByExercise.set(s.exerciseId, arr);
  }

  const exerciseRows = workout.exerciseLinks.map(({ exercise }) => {
    const exSets = setsByExercise.get(exercise.id) ?? [];
    const setsCompleted = exSets.length > 0 ? exSets.filter((s) => s.completed).length : exercise.sets;
    const setsExpected = exercise.sets;
    const lastWeight =
      exSets.find((s) => s.weightLbs != null)?.weightLbs ?? exercise.weightLbs;
    return { exercise, setsCompleted, setsExpected, lastWeight, hasSetData: exSets.length > 0 };
  });

  const totalCompleted = exerciseRows.reduce((a, e) => a + e.setsCompleted, 0);
  const totalExpected = exerciseRows.reduce((a, e) => a + e.setsExpected, 0);
  const completion =
    totalExpected > 0
      ? Math.round((totalCompleted / totalExpected) * 100)
      : workout.adherencePercent != null
      ? Math.round(workout.adherencePercent)
      : null;

  const hasSetData = exerciseRows.some((r) => r.hasSetData);

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        background: "rgba(255,255,255,0.025)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: `${CYAN}15`,
            border: `1px solid ${CYAN}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: CYAN,
          }}
        >
          <LuDumbbell size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {workout.workoutPlan && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: CYAN,
                marginBottom: 3,
              }}
            >
              ▸ {workout.workoutPlan.name}
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
            }}
          >
            {fmtDate(workout.createdAt)}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "rgba(255,255,255,0.42)",
              marginTop: 4,
            }}
          >
            {fmtRel(workout.createdAt)} · {fmtDuration(workout.durationSeconds)}
            {hasSetData && totalExpected > 0
              ? ` · ${totalCompleted}/${totalExpected} sets (${completion}%)`
              : completion != null
              ? ` · ${completion}% completion`
              : ""}
          </div>
        </div>
        {rating != null && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {rating}
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", marginLeft: 1 }}>
                /10
              </span>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9.5,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              Session
            </div>
          </div>
        )}
      </div>

      {/* Body — 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr" }}>
        {/* Exercises table */}
        <div style={{ padding: "14px 18px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: CYAN }} />
            Exercises
          </div>
          {exerciseRows.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "4px 0 8px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: "1px dashed rgba(255,255,255,0.08)",
                    }}
                  >
                    Exercise
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 8px 8px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: "1px dashed rgba(255,255,255,0.08)",
                      width: 90,
                    }}
                  >
                    Sets
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "4px 0 8px 8px",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.35)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      borderBottom: "1px dashed rgba(255,255,255,0.08)",
                      width: 110,
                    }}
                  >
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {exerciseRows.map(
                  ({ exercise, setsCompleted, setsExpected, lastWeight, hasSetData: exHasData }, i) => {
                    const miss = exHasData && setsCompleted < setsExpected;
                    const isLast = i === exerciseRows.length - 1;
                    return (
                      <tr key={exercise.id}>
                        <td
                          style={{
                            padding: "10px 8px 10px 0",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.92)",
                            borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {exercise.name}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12.5,
                            textAlign: "right",
                            borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          <span style={{ color: miss ? "#fbbf24" : "#fff", fontWeight: 700 }}>
                            {setsCompleted}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.4)" }}>
                            {" "}/ {setsExpected}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px 0 10px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "rgba(255,255,255,0.75)",
                            fontWeight: 600,
                            textAlign: "right",
                            borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {lastWeight != null ? `${lastWeight} lb` : "—"}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          ) : (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              No exercises recorded
            </div>
          )}
        </div>

        {/* Pre-session */}
        <div style={{ padding: "14px 18px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a78bfa" }} />
            Pre-session
          </div>
          {(
            [
              { lbl: "Energy", v: workout.preSessionEnergy, inv: false },
              { lbl: "Soreness", v: workout.preSessionSoreness, inv: true },
              { lbl: "Stress", v: workout.preSessionStress, inv: true },
            ] as const
          ).map(({ lbl, v, inv }) =>
            v != null ? (
              <div
                key={lbl}
                style={{
                  padding: "9px 11px",
                  marginBottom: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "rgba(255,255,255,0.45)",
                  }}
                >
                  {lbl}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 800,
                      color: scoreColor(v, inv),
                      lineHeight: 1,
                    }}
                  >
                    {v}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                    /10
                  </span>
                </div>
              </div>
            ) : null,
          )}
          {workout.preSessionEnergy == null &&
            workout.preSessionSoreness == null &&
            workout.preSessionStress == null && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No data</div>
            )}
        </div>

        {/* Post-session */}
        <div style={{ padding: "14px 18px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fbbf24" }} />
            Post-session
          </div>
          {workout.postSessionEnergy != null && (
            <div
              style={{
                padding: "9px 11px",
                marginBottom: 8,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Energy after
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 800,
                    color: scoreColor(workout.postSessionEnergy, false),
                    lineHeight: 1,
                  }}
                >
                  {workout.postSessionEnergy}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                  /10
                </span>
              </div>
            </div>
          )}
          {completion != null && (
            <div
              style={{
                marginTop: workout.postSessionEnergy != null ? 14 : 0,
                padding: "10px 12px",
                background: `${accentColor}08`,
                border: `1px solid ${accentColor}22`,
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9.5,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.45)",
                  marginBottom: 2,
                }}
              >
                Completion
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                  color: accentColor,
                  lineHeight: 1,
                }}
              >
                {completion}%
              </div>
              {hasSetData && (
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.4)",
                    marginTop: 2,
                  }}
                >
                  {totalCompleted} of {totalExpected} sets
                </div>
              )}
            </div>
          )}
          {workout.postSessionEnergy == null && completion == null && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>No data</div>
          )}
        </div>
      </div>

      {/* Trainer Rating row */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: PINK }} />
          Trainer Rating · Session Quality
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
            const selected = n === rating;
            const inRange = rating != null && n < rating;
            return (
              <button
                key={n}
                type="button"
                disabled={isPending}
                onClick={() => handleRatingClick(n)}
                style={{
                  flex: 1,
                  height: 34,
                  border: selected
                    ? "none"
                    : `1px solid ${inRange ? "rgba(253,109,187,0.22)" : "rgba(255,255,255,0.1)"}`,
                  background: selected
                    ? `linear-gradient(135deg, ${PINK}, #e855a0)`
                    : inRange
                    ? "rgba(253,109,187,0.08)"
                    : "rgba(255,255,255,0.03)",
                  color: selected
                    ? "#1a0010"
                    : inRange
                    ? "rgba(253,109,187,0.65)"
                    : "rgba(255,255,255,0.5)",
                  borderRadius: 8,
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: selected ? 800 : 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  outline: "none",
                  boxShadow: selected ? `0 4px 14px rgba(253,109,187,0.4)` : "none",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TraineeWorkoutsPanel({
  workouts,
  accentColor,
  traineeId,
}: {
  workouts: WorkoutPanelEntry[];
  accentColor: string;
  traineeId: string;
}) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <div
          style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "#fff" }}
        >
          Logged Workouts
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          · {workouts.length}
        </span>
      </div>

      <div style={{ padding: "16px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
        {workouts.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
            }}
          >
            No workouts logged yet — sessions appear here once the trainee completes a plan
          </div>
        ) : (
          workouts.map((w) => (
            <WorkoutCard
              key={w.id}
              workout={w}
              accentColor={accentColor}
              traineeId={traineeId}
            />
          ))
        )}
      </div>
    </div>
  );
}

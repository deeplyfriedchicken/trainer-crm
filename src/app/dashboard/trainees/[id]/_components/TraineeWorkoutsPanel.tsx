"use client";

import { useOptimistic, useTransition } from "react";
import { LuCheck, LuDumbbell, LuX } from "react-icons/lu";
import { updateSessionQuality } from "../actions";

type WorkoutSet = {
  exerciseId: string;
  completed: boolean;
  weightLbs: number | null;
  reps: number | null;
  durationSeconds: number | null;
  position: number;
  metadata: unknown;
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
  preSessionNote: string | null;
  postSessionEnergy: number | null;
  sessionQuality: number | null;
  adherencePercent: number | null;
  comment: string | null;
  workoutPlan: { id: string; name: string } | null;
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

function SectionLabel({
  dot,
  label,
}: {
  dot: string;
  label: string;
}) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.4)",
        marginBottom: 8,
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot }} />
      {label}
    </div>
  );
}

function MetricPill({
  label,
  value,
  inverted,
}: {
  label: string;
  value: number;
  inverted: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 11px",
        marginBottom: 6,
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
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 20,
            fontWeight: 800,
            color: scoreColor(value, inverted),
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>/10</span>
      </div>
    </div>
  );
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

  // Group sets by exerciseId
  const setsByExercise = new Map<string, WorkoutSet[]>();
  for (const s of workout.sets) {
    const arr = setsByExercise.get(s.exerciseId) ?? [];
    arr.push(s);
    setsByExercise.set(s.exerciseId, arr);
  }

  const exerciseRows = workout.exerciseLinks.map(({ exercise }) => {
    const exSets = (setsByExercise.get(exercise.id) ?? []).sort(
      (a, b) => a.position - b.position,
    );
    const setsCompleted =
      exSets.length > 0 ? exSets.filter((s) => s.completed).length : exercise.sets;
    const setsExpected = exercise.sets;
    return { exercise, exSets, setsCompleted, setsExpected, hasSetData: exSets.length > 0 };
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

  const hasRightContent =
    workout.preSessionEnergy != null ||
    workout.preSessionSoreness != null ||
    workout.preSessionStress != null ||
    workout.postSessionEnergy != null ||
    completion != null;

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
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}
          >
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

      {/* Comment */}
      {workout.comment && (
        <div
          style={{
            padding: "10px 18px",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            fontStyle: "italic",
            lineHeight: 1.55,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {workout.comment}
        </div>
      )}

      {/* Body — 2-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
        {/* Exercises table */}
        <div style={{ padding: "14px 18px", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
          <SectionLabel dot={CYAN} label="Exercises" />
          {exerciseRows.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {exerciseRows.map(
                  ({ exercise, exSets, setsCompleted, setsExpected, hasSetData: exHasData }) => {
                    const miss = exHasData && setsCompleted < setsExpected;
                    return (
                      <>
                        {/* Exercise sub-header row */}
                        <tr key={`hdr-${exercise.id}`}>
                          <td
                            colSpan={4}
                            style={{
                              padding: "8px 6px 5px",
                              background: "rgba(255,255,255,0.03)",
                              borderRadius: 6,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "rgba(255,255,255,0.92)",
                                }}
                              >
                                {exercise.name}
                              </span>
                              <span
                                style={{
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: miss ? "#fbbf24" : "rgba(255,255,255,0.45)",
                                }}
                              >
                                {setsCompleted}/{setsExpected}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Set rows */}
                        {exHasData
                          ? exSets.map((set, si) => {
                              const meta =
                                set.metadata !== null &&
                                typeof set.metadata === "object"
                                  ? (set.metadata as Record<string, unknown>)
                                  : null;
                              const side =
                                typeof meta?.side === "string" ? meta.side : null;
                              const repVal =
                                exercise.type === "duration"
                                  ? set.durationSeconds != null
                                    ? `${set.durationSeconds}s`
                                    : "—"
                                  : set.reps != null
                                    ? String(set.reps)
                                    : "—";

                              return (
                                <tr key={`set-${exercise.id}-${si}`}>
                                  {/* Set label + side */}
                                  <td
                                    style={{
                                      padding: "5px 6px 5px 10px",
                                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    }}
                                  >
                                    <div
                                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                                    >
                                      {side && (
                                        <span
                                          style={{
                                            fontFamily: "var(--font-mono)",
                                            fontSize: 9,
                                            fontWeight: 700,
                                            color: CYAN,
                                            background: `${CYAN}15`,
                                            border: `1px solid ${CYAN}33`,
                                            borderRadius: 4,
                                            padding: "1px 4px",
                                          }}
                                        >
                                          {side.toUpperCase()}
                                        </span>
                                      )}
                                      <span
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                          fontSize: 10,
                                          color: "rgba(255,255,255,0.35)",
                                        }}
                                      >
                                        SET {si + 1}
                                      </span>
                                    </div>
                                  </td>
                                  {/* Reps / Duration */}
                                  <td
                                    style={{
                                      padding: "5px 6px",
                                      fontFamily: "var(--font-mono)",
                                      fontSize: 12,
                                      color: "rgba(255,255,255,0.75)",
                                      fontWeight: 600,
                                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    }}
                                  >
                                    {repVal}
                                  </td>
                                  {/* Weight */}
                                  <td
                                    style={{
                                      padding: "5px 6px",
                                      fontFamily: "var(--font-mono)",
                                      fontSize: 12,
                                      color: "rgba(255,255,255,0.55)",
                                      textAlign: "right",
                                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                                    }}
                                  >
                                    {set.weightLbs != null ? `${set.weightLbs} lb` : "—"}
                                  </td>
                                  {/* Status */}
                                  <td
                                    style={{
                                      padding: "5px 6px 5px 8px",
                                      textAlign: "right",
                                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                                      width: 22,
                                    }}
                                  >
                                    {set.completed ? (
                                      <LuCheck
                                        size={12}
                                        color="#4ade80"
                                        strokeWidth={2.5}
                                      />
                                    ) : (
                                      <LuX
                                        size={11}
                                        color="rgba(248,113,113,0.6)"
                                        strokeWidth={2.5}
                                      />
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          : /* Fallback summary row when no set data */ (
                            <tr key={`fallback-${exercise.id}`}>
                              <td
                                style={{
                                  padding: "5px 6px 5px 10px",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.4)",
                                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                                }}
                              >
                                {exercise.sets}×
                                {exercise.type === "duration"
                                  ? `${exercise.durationSeconds}s`
                                  : exercise.reps}
                              </td>
                              <td
                                colSpan={3}
                                style={{
                                  padding: "5px 6px",
                                  fontFamily: "var(--font-mono)",
                                  fontSize: 11,
                                  color: "rgba(255,255,255,0.4)",
                                  textAlign: "right",
                                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                                }}
                              >
                                {exercise.weightLbs != null ? `${exercise.weightLbs} lb` : "—"}
                              </td>
                            </tr>
                          )}

                        {/* Spacer between exercises */}
                        <tr key={`spacer-${exercise.id}`}>
                          <td colSpan={4} style={{ height: 6 }} />
                        </tr>
                      </>
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

        {/* Right panel: pre-session + post-session + completion */}
        <div style={{ padding: "14px 16px" }}>
          {/* Pre-session */}
          {(workout.preSessionEnergy != null ||
            workout.preSessionSoreness != null ||
            workout.preSessionStress != null ||
            workout.preSessionNote) && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel dot="#a78bfa" label="Pre-session" />
              {workout.preSessionEnergy != null && (
                <MetricPill label="Energy" value={workout.preSessionEnergy} inverted={false} />
              )}
              {workout.preSessionSoreness != null && (
                <MetricPill
                  label="Soreness"
                  value={workout.preSessionSoreness}
                  inverted={true}
                />
              )}
              {workout.preSessionStress != null && (
                <MetricPill label="Stress" value={workout.preSessionStress} inverted={true} />
              )}
              {workout.preSessionNote && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    fontStyle: "italic",
                    color: "rgba(255,255,255,0.5)",
                    lineHeight: 1.5,
                  }}
                >
                  "{workout.preSessionNote}"
                </div>
              )}
            </div>
          )}

          {/* Post-session */}
          {workout.postSessionEnergy != null && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel dot="#fbbf24" label="Post-session" />
              <MetricPill label="Energy after" value={workout.postSessionEnergy} inverted={false} />
            </div>
          )}

          {/* Completion */}
          {completion != null && (
            <div>
              <SectionLabel dot={accentColor} label="Completion" />
              <div
                style={{
                  padding: "10px 12px",
                  background: `${accentColor}08`,
                  border: `1px solid ${accentColor}22`,
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
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
                      marginTop: 3,
                    }}
                  >
                    {totalCompleted} of {totalExpected} sets
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasRightContent && (
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
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}
        >
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
            <WorkoutCard key={w.id} workout={w} accentColor={accentColor} traineeId={traineeId} />
          ))
        )}
      </div>
    </div>
  );
}

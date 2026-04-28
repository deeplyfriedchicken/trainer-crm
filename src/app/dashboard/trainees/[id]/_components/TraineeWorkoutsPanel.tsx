"use client";

import { useState } from "react";
import { LuCalendar, LuChevronDown, LuClock, LuDumbbell } from "react-icons/lu";
import type { WorkoutRow } from "@/db/queries/workouts";

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RatingBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span
      style={{
        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
        background: `${color}18`, color, border: `1px solid ${color}33`,
        fontFamily: "var(--font-neon-mono)",
      }}
    >
      {label} {value}/10
    </span>
  );
}

export function TraineeWorkoutsPanel({
  workouts,
  accentColor,
}: {
  workouts: WorkoutRow[];
  accentColor: string;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div
      style={{
        background: "var(--neon-surface)",
        border: "1px solid var(--neon-border)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid var(--neon-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Workout History</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          {workouts.length} logged
        </div>
      </div>

      {workouts.map((w) => {
        const isOpen = openIds.has(w.id);
        return (
          <div
            key={w.id}
            style={{ borderBottom: "1px solid var(--neon-border)" }}
          >
            <div
              role="button"
              tabIndex={0}
              style={{
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
              }}
              onClick={() => toggle(w.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(w.id); }}
            >
              <div
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: accentColor,
                }}
              >
                <LuDumbbell size={13} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                    {w.workoutPlan?.name ?? fmtDate(w.createdAt)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 3 }}>
                    <LuCalendar size={10} /> {fmtDate(w.createdAt)}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 3 }}>
                    <LuClock size={10} /> {fmtDuration(w.durationSeconds)}
                  </span>
                  {w.energyRating != null && (
                    <RatingBadge label="Energy" value={w.energyRating} color={accentColor} />
                  )}
                  {w.painRating != null && (
                    <RatingBadge label="Pain" value={w.painRating} color="#f87171" />
                  )}
                </div>
              </div>

              <LuChevronDown
                size={14}
                color="rgba(255,255,255,0.3)"
                style={{ transform: isOpen ? "rotate(180deg)" : undefined, transition: "transform 0.2s", flexShrink: 0 }}
              />
            </div>

            {isOpen && (
              <div
                style={{
                  padding: "0 18px 14px 18px",
                  borderTop: "1px solid var(--neon-border)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                {w.comment && (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic", margin: "12px 0 8px", lineHeight: 1.5 }}>
                    "{w.comment}"
                  </p>
                )}
                {w.exerciseLinks.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: w.comment ? 8 : 12 }}>
                    {w.exerciseLinks.map(({ exercise, setsData }) => (
                      <div
                        key={exercise.id}
                        style={{
                          borderRadius: 9,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-neon-display)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                          {exercise.name}
                        </div>
                        <div>
                          {setsData && setsData.length > 0 ? (
                            setsData.map((s, i) => {
                              const isDur = s.durationSeconds != null;
                              return (
                                <div
                                  key={i}
                                  style={{
                                    display: "grid", gridTemplateColumns: "42px 1fr 1fr 20px",
                                    alignItems: "center", gap: 8, padding: "5px 12px",
                                    borderBottom: i < setsData.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                                    opacity: s.completed ? 1 : 0.35,
                                    fontFamily: "var(--font-neon-mono)",
                                  }}
                                >
                                  <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
                                    SET {i + 1}
                                  </span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                                    {isDur ? s.durationSeconds : s.reps}
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: 3, fontWeight: 400 }}>
                                      {isDur ? "SEC" : "REPS"}
                                    </span>
                                  </span>
                                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                                    {s.weightLbs ? `${s.weightLbs} lbs` : "—"}
                                  </span>
                                  <span style={{ fontSize: 11, color: s.completed ? accentColor : "rgba(255,255,255,0.2)", justifySelf: "end" }}>
                                    {s.completed ? "✓" : "✕"}
                                  </span>
                                </div>
                              );
                            })
                          ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "42px 1fr 1fr 20px", alignItems: "center", gap: 8, padding: "5px 12px", fontFamily: "var(--font-neon-mono)" }}>
                              <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>PLAN</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
                                {exercise.type === "duration" ? exercise.durationSeconds : exercise.reps}
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: 3, fontWeight: 400 }}>
                                  {exercise.type === "duration" ? "SEC" : "REPS"}
                                </span>
                              </span>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{exercise.sets} sets</span>
                              <span />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

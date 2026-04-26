"use client";

import { useState } from "react";
import { LuCalendar, LuDumbbell } from "react-icons/lu";
import styles from "./SessionsPanel.module.css";

export type SessionExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  comment?: string | null;
};

export type SessionEntry = {
  id: string;
  occurredAt: Date;
  energyRating?: number | null;
  painRating?: number | null;
  comment?: string | null;
  exercises: SessionExercise[];
};

function StarGroup({
  rating,
  label,
  color,
}: {
  rating: number;
  label: string;
  color: string;
}) {
  return (
    <div className={styles.starGroup}>
      <div className={styles.starLabel}>{label}</div>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill={n <= rating ? color : "rgba(255,255,255,0.1)"}
            stroke={n <= rating ? color : "rgba(255,255,255,0.15)"}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <div className={styles.starValue}>{rating}/5</div>
    </div>
  );
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SessionsPanel({
  sessions,
  accentColor = "var(--neon-pink)",
}: {
  sessions: SessionEntry[];
  accentColor?: string;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const sorted = [...sessions].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>Sessions</div>
        <div className={styles.panelCount}>{sessions.length} total</div>
      </div>

      <div className={styles.list}>
        {sorted.length === 0 && (
          <div className={styles.empty}>No sessions yet.</div>
        )}

        {sorted.map((s, i) => {
          const isOpen = openIdx === i;
          const sessionNumber = sessions.length - i;

          return (
            <div key={s.id} className={styles.row}>
              <button
                type="button"
                className={styles.rowHeader}
                onClick={() => setOpenIdx(isOpen ? null : i)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${accentColor}18`,
                      border: `1px solid ${accentColor}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: accentColor,
                    }}
                  >
                    <LuCalendar size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                      Session #{sessionNumber}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                      {formatDate(s.occurredAt)}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {s.energyRating != null && (
                    <>
                      <StarGroup rating={s.energyRating} label="Energy" color={accentColor} />
                      <div className={styles.divider} />
                    </>
                  )}
                  {s.painRating != null && (
                    <>
                      <StarGroup rating={s.painRating} label="Pain" color="#f87171" />
                      <div className={styles.divider} />
                    </>
                  )}
                  <svg
                    width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                    className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>

              <div className={styles.rowBody} style={{ maxHeight: isOpen ? 600 : 0 }}>
                <div className={styles.rowBodyInner}>
                  {s.comment && (
                    <div className={styles.note}>
                      <div className={styles.noteLabel} style={{ color: "rgba(255,255,255,0.35)" }}>
                        Client Feedback
                      </div>
                      <p className={styles.noteText} style={{ fontStyle: "italic" }}>
                        "{s.comment}"
                      </p>
                    </div>
                  )}

                  {s.exercises.length > 0 && (
                    <>
                      <div className={styles.exercisesLabel}>Exercises</div>
                      <div className={styles.exerciseList}>
                        {s.exercises.map((ex) => (
                          <div key={ex.id} className={styles.exerciseRow}>
                            <div
                              style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: `${accentColor}18`,
                                border: `1px solid ${accentColor}33`,
                                display: "flex", alignItems: "center",
                                justifyContent: "center", flexShrink: 0,
                                color: accentColor,
                              }}
                            >
                              <LuDumbbell size={12} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {ex.name}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: 5, padding: "2px 7px" }}>
                                {ex.sets} sets
                              </span>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>×</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, padding: "2px 7px" }}>
                                {ex.reps} reps
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {!s.comment && s.exercises.length === 0 && (
                    <p style={{ fontSize: 13, color: "var(--neon-text-dim)", margin: "12px 0 4px", fontStyle: "italic" }}>
                      No details recorded for this session.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { LuCalendar, LuChevronLeft, LuChevronRight, LuDumbbell, LuPencil } from "react-icons/lu";
import { Dialog, DialogBody } from "./Dialog";
import styles from "./SessionsPanel.module.css";

// ── Types ─────────────────────────────────────────────────────────────────

export type ExerciseVideo = { id: string; title: string; url: string };

export type SessionExercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  comment?: string | null;
  videos: ExerciseVideo[];
};

export type SessionEntry = {
  id: string;
  occurredAt: Date;
  energyRating?: number | null;
  painRating?: number | null;
  comment?: string | null;
  exercises: SessionExercise[];
};

// ── Sub-components ────────────────────────────────────────────────────────

function StarGroup({ rating, label, color }: { rating: number; label: string; color: string }) {
  return (
    <div className={styles.starGroup}>
      <div className={styles.starLabel}>{label}</div>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} width="9" height="9" viewBox="0 0 24 24"
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
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Exercise video modal (single or slideshow) ────────────────────────────

function ExerciseVideoModal({
  exercise,
  accentColor,
  onClose,
}: {
  exercise: SessionExercise;
  accentColor: string;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const videos = exercise.videos;
  const current = videos[idx];
  const total = videos.length;

  if (!current) return null;

  return (
    <Dialog isOpen onClose={onClose} maxWidth={880}>
      <video
        key={current.url}
        src={current.url}
        controls
        autoPlay
        style={{ width: "100%", display: "block", maxHeight: "50vh", background: "#000" }}
      />

      <DialogBody>
        {/* Slideshow controls — only shown when there are multiple videos */}
        {total > 1 && (
          <div className={styles.slideNav}>
            <button
              type="button"
              className={styles.slideArrow}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              disabled={idx === 0}
            >
              <LuChevronLeft size={16} />
            </button>

            <div className={styles.slideDots}>
              {videos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.slideDot}${i === idx ? ` ${styles.slideDotActive}` : ""}`}
                  style={{ "--dot-color": accentColor } as React.CSSProperties}
                  onClick={() => setIdx(i)}
                  aria-label={`Video ${i + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              className={styles.slideArrow}
              onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
              disabled={idx === total - 1}
            >
              <LuChevronRight size={16} />
            </button>

            <span className={styles.slideCount}>{idx + 1} / {total}</span>
          </div>
        )}

        {/* Exercise info */}
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
          {exercise.name}
        </div>
        {current.title && (
          <div style={{ fontSize: 12, color: "rgba(52,253,254,0.7)", marginBottom: 14 }}>
            {current.title}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: exercise.comment ? 14 : 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: 6, padding: "3px 10px" }}>
            {exercise.sets} sets
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", alignSelf: "center" }}>×</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "3px 10px" }}>
            {exercise.reps} reps
          </span>
        </div>

        {exercise.comment && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
            {exercise.comment}
          </p>
        )}
      </DialogBody>
    </Dialog>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────

export function SessionsPanel({
  sessions,
  accentColor = "var(--neon-pink)",
  onNewSession,
  onEditSession,
}: {
  sessions: SessionEntry[];
  accentColor?: string;
  onNewSession?: () => void;
  onEditSession?: (session: SessionEntry) => void;
}) {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(sorted[0] ? [sorted[0].id] : []),
  );
  const [videoExercise, setVideoExercise] = useState<SessionExercise | null>(null);

  function toggleRow(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Sessions</div>
          {onNewSession ? (
            <button
              type="button"
              className={styles.newBtn}
              style={{ background: `${accentColor}1e`, border: `1px solid ${accentColor}55`, color: accentColor }}
              onClick={onNewSession}
            >
              + New
            </button>
          ) : (
            <div className={styles.panelCount}>{sessions.length} total</div>
          )}
        </div>

        <div className={styles.list}>
          {sorted.length === 0 && <div className={styles.empty}>No sessions yet.</div>}

          {sorted.map((s, i) => {
            const isOpen = openIds.has(s.id);
            const sessionNumber = sessions.length - i;

            return (
              <div key={s.id} className={styles.row}>
                <div
                  className={styles.rowHeader}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleRow(s.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleRow(s.id); }}
                >
                  {/* Left */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, color: accentColor,
                    }}>
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

                  {/* Right */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {s.energyRating != null && (
                      <><StarGroup rating={s.energyRating} label="Energy" color={accentColor} /><div className={styles.divider} /></>
                    )}
                    {s.painRating != null && (
                      <><StarGroup rating={s.painRating} label="Pain" color="#f87171" /><div className={styles.divider} /></>
                    )}
                    {onEditSession && (
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={(e) => { e.stopPropagation(); onEditSession(s); }}
                        title="Edit session"
                      >
                        <LuPencil size={12} />
                      </button>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                      className={`${styles.chevron}${isOpen ? ` ${styles.chevronOpen}` : ""}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </div>

                <div className={styles.rowBody} style={{ maxHeight: isOpen ? 900 : 0 }}>
                  <div className={styles.rowBodyInner}>
                    {s.comment && (
                      <div className={styles.note}>
                        <div className={styles.noteLabel} style={{ color: "rgba(255,255,255,0.35)" }}>Notes</div>
                        <p className={styles.noteText}>{s.comment}</p>
                      </div>
                    )}

                    {s.exercises.length > 0 && (
                      <>
                        <div className={styles.exercisesLabel}>Exercises</div>
                        <div className={styles.exerciseList}>
                          {s.exercises.map((ex) => (
                            <div key={ex.id} className={styles.exerciseRow}>
                              <div style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: `${accentColor}18`, border: `1px solid ${accentColor}33`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, color: accentColor,
                              }}>
                                <LuDumbbell size={12} />
                              </div>

                              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {ex.name}
                              </div>

                              {/* Sets × Reps */}
                              <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, background: `${accentColor}15`, border: `1px solid ${accentColor}30`, borderRadius: 5, padding: "2px 7px" }}>
                                  {ex.sets} sets
                                </span>
                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>×</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 5, padding: "2px 7px" }}>
                                  {ex.reps} reps
                                </span>
                              </div>

                              {/* Play button — shown when at least one video is linked */}
                              {ex.videos.length > 0 && (
                                <button
                                  type="button"
                                  className={styles.playBtn}
                                  onClick={() => setVideoExercise(ex)}
                                  title={ex.videos.length > 1 ? `${ex.videos.length} videos` : ex.videos[0]?.title}
                                >
                                  <FaPlay size={8} color="#34FDFE" />
                                  {ex.videos.length > 1 && (
                                    <span className={styles.playCount}>{ex.videos.length}</span>
                                  )}
                                </button>
                              )}
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

      {videoExercise && (
        <ExerciseVideoModal
          exercise={videoExercise}
          accentColor={accentColor}
          onClose={() => setVideoExercise(null)}
        />
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { LuChevronLeft, LuPause, LuVideo } from "react-icons/lu";
import type { PlanForLog } from "@/db/queries/client";
import { BottomSheet } from "@/app/components/BottomSheet";
import { Checkbox } from "@/app/components/Checkbox";
import { IconButton } from "@/app/components/IconButton";
import { FeedbackModal } from "./FeedbackModal";

interface Props {
  token: string;
  plan: PlanForLog;
  backHref: string;
}

type SetState = { reps: number; weightLbs: number; completed: boolean };
type ExerciseLog = { id: string; sets: SetState[] };

function fmtDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function NumericStepper({
  value,
  onChange,
  step = 1,
  min = 0,
  unit,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  unit: string;
}) {
  return (
    <div className="log-stepper-wrap">
      <button
        type="button"
        className="log-stepper-btn"
        onClick={() =>
          onChange(Math.max(min, parseFloat((value - step).toFixed(4))))
        }
        aria-label={`Decrease ${unit}`}
      >
        −
      </button>
      <div className="log-stepper-center">
        <input
          type="number"
          inputMode="decimal"
          className="log-stepper-input"
          value={value}
          min={min}
          step={step}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            onChange(Number.isNaN(n) ? min : Math.max(min, n));
          }}
        />
        <span className="log-stepper-unit">{unit}</span>
      </div>
      <button
        type="button"
        className="log-stepper-btn"
        onClick={() => onChange(parseFloat((value + step).toFixed(4)))}
        aria-label={`Increase ${unit}`}
      >
        +
      </button>
    </div>
  );
}

export function LogWorkoutClient({ token, plan, backHref }: Props) {
  const startTimeRef = useRef(Date.now());
  const totalPausedRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);

  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [videoModalEx, setVideoModalEx] = useState<
    PlanForLog["exercises"][number] | null
  >(null);

  const cdRef = useRef<{
    exIdx: number;
    setIdx: number;
    remaining: number;
    total: number;
  } | null>(null);
  const [cdRemaining, setCdRemaining] = useState<number | null>(null);
  const cdTotalRef = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const [log, setLog] = useState<ExerciseLog[]>(() =>
    plan.exercises.map((ex) => ({
      id: ex.id,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: ex.reps ?? ex.durationSeconds ?? 0,
        weightLbs: ex.weightLbs ?? 0,
        completed: false,
      })),
    })),
  );

  useEffect(() => {
    if (paused) {
      pausedAtRef.current = Date.now();
      return;
    }
    if (pausedAtRef.current !== null) {
      totalPausedRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    const interval = setInterval(() => {
      setElapsed(
        Math.floor(
          (Date.now() - startTimeRef.current - totalPausedRef.current) / 1000,
        ),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      if (!cdRef.current) return;
      if (cdRef.current.remaining > 1) {
        cdRef.current.remaining -= 1;
        setCdRemaining(cdRef.current.remaining);
      } else {
        const { exIdx, setIdx } = cdRef.current;
        cdRef.current = null;
        setCdRemaining(null);
        setLog((prev) => {
          const nextLog = prev.map((e) => ({
            ...e,
            sets: e.sets.map((s) => ({ ...s })),
          }));
          nextLog[exIdx].sets[setIdx].completed = true;
          return nextLog;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateReps = (exIdx: number, setIdx: number, val: number) => {
    setLog((prev) => {
      const next = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      next[exIdx].sets[setIdx].reps = val;
      return next;
    });
  };

  const updateWeight = (exIdx: number, setIdx: number, val: number) => {
    setLog((prev) => {
      const next = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      next[exIdx].sets[setIdx].weightLbs = val;
      return next;
    });
  };

  const handleSetClick = (exIdx: number, setIdx: number) => {
    const ex = plan.exercises[exIdx];
    const setLogEntry = log[exIdx].sets[setIdx];
    if (ex.type === "duration") {
      const duration = setLogEntry.reps;
      if (duration <= 0) {
        toggleSet(exIdx, setIdx);
      } else {
        cdRef.current = { exIdx, setIdx, remaining: duration, total: duration };
        cdTotalRef.current = duration;
        setCdRemaining(duration);
      }
    } else {
      toggleSet(exIdx, setIdx);
    }
  };

  const toggleSet = (exIdx: number, setIdx: number) => {
    setLog((prev) => {
      const next = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      next[exIdx].sets[setIdx].completed = !next[exIdx].sets[setIdx].completed;
      return next;
    });
  };

  const fmtDate = new Date(plan.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const buildExerciseLogs = () =>
    plan.exercises.map((ex, exIdx) => ({
      exerciseId: ex.id,
      sets: log[exIdx].sets.map((s) => ({
        ...(ex.type === "duration"
          ? { durationSeconds: s.reps }
          : { reps: s.reps }),
        ...(s.weightLbs > 0 ? { weightLbs: s.weightLbs } : {}),
        completed: s.completed,
      })),
    }));

  return (
    <div className="client-page">
      <div className="client-topbar">
        <div className="client-topbar-inner">
          <Link href={backHref} className="client-back-btn">
            <LuChevronLeft size={18} /> Cancel
          </Link>
        </div>
      </div>

      <div className="client-inner log-page">
        <div style={{ padding: "20px 0 4px" }}>
          <div className="log-plan-name">{plan.name}</div>
          <div className="log-subtitle">
            {fmtDate} · {plan.exercises.length} exercise
            {plan.exercises.length !== 1 ? "s" : ""} · Tap checkboxes to
            complete sets
          </div>
        </div>

        {plan.exercises.map((ex, exIdx) => {
          const exLog = log[exIdx];
          const completedCount = exLog.sets.filter((s) => s.completed).length;
          const isDuration = ex.type === "duration";

          return (
            <div key={ex.id} className="log-exercise-card">
              <div className="log-ex-header">
                <div className="log-ex-num">{exIdx + 1}</div>
                <div className="log-ex-name">{ex.name}</div>
                {ex.videoLinks.length > 0 && (
                  <IconButton
                    variant="ghost"
                    colorScheme="pink"
                    size="sm"
                    onClick={() => setVideoModalEx(ex)}
                    aria-label="Watch video"
                    title="Watch video"
                    style={{ marginRight: 4 }}
                  >
                    <LuVideo size={14} />
                  </IconButton>
                )}
                <div className="log-ex-note">
                  {completedCount}/{exLog.sets.length}
                </div>
              </div>

              {ex.comment && <div className="log-ex-desc">{ex.comment}</div>}

              <div className="log-sets-table">
                {exLog.sets.map((set, setIdx) => {
                  const isDisabled =
                    setIdx > 0 && !exLog.sets[setIdx - 1].completed;
                  return (
                    <div
                      key={setIdx}
                      className={`log-set-row${set.completed ? " completed" : ""}${isDisabled ? " disabled" : ""}`}
                    >
                      <div className="log-set-label">SET {setIdx + 1}</div>

                      <NumericStepper
                        value={set.reps}
                        onChange={(n) => updateReps(exIdx, setIdx, n)}
                        step={isDuration ? 5 : 1}
                        unit={isDuration ? "SEC" : "REPS"}
                      />

                      <NumericStepper
                        value={set.weightLbs}
                        onChange={(n) => updateWeight(exIdx, setIdx, n)}
                        step={2.5}
                        unit="LBS"
                      />

                      <Checkbox
                        colorScheme="cyan"
                        checked={set.completed}
                        disabled={isDisabled}
                        onCheckedChange={() => handleSetClick(exIdx, setIdx)}
                        style={{ justifySelf: "end" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer Bar */}
      <div className="timer-bar">
        <div className="timer-bar-inner">
          <div className={`timer-dot ${paused ? "paused" : "running"}`} />
          <div className="timer-info">
            <span className="timer-label">
              {paused ? "Paused" : "Duration"}
            </span>
            <div className="timer-time">{fmtDuration(elapsed)}</div>
          </div>
          <button
            type="button"
            className={`timer-pause-btn${paused ? " paused" : ""}`}
            onClick={() => setPaused((p) => !p)}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <FaPlay size={16} /> : <LuPause size={16} />}
          </button>
          <button
            type="button"
            className="timer-finish"
            onClick={() => setShowFeedback(true)}
          >
            Finish Workout
          </button>
        </div>
      </div>

      {showFeedback && (
        <FeedbackModal
          token={token}
          planId={plan.id}
          exerciseLogs={buildExerciseLogs()}
          duration={elapsed}
          onCancel={() => setShowFeedback(false)}
        />
      )}

      {/* Countdown Overlay */}
      {cdRemaining !== null && (
        <div className="cd-overlay">
          <div className="cd-content">
            <div className="cd-ring">
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="72"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 72}`}
                  strokeDashoffset={`${2 * Math.PI * 72 * (1 - cdRemaining / cdTotalRef.current)}`}
                  transform="rotate(-90 80 80)"
                  style={{ transition: "stroke-dashoffset 0.3s linear" }}
                />
              </svg>
              <div className="cd-ring-time">{fmtDuration(cdRemaining)}</div>
            </div>
          </div>
        </div>
      )}

      {videoModalEx && (
        <BottomSheet
          onClose={() => setVideoModalEx(null)}
          title={videoModalEx.name}
          subtitle="Demo Video"
          titleAction={
            <IconButton
              variant="ghost"
              colorScheme="neutral"
              size="sm"
              onClick={() => setVideoModalEx(null)}
              aria-label="Close"
            >
              ×
            </IconButton>
          }
          zIndex={250}
        >
            {videoModalEx.videoLinks[0] && (
              <div
                style={{
                  margin: "12px 16px 20px",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#000",
                }}
              >
                <video
                  src={videoModalEx.videoLinks[0].video.fileUrl}
                  controls
                  playsInline
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "60vh",
                    border: "none",
                    display: "block",
                  }}
                />
              </div>
            )}
        </BottomSheet>
      )}
    </div>
  );
}

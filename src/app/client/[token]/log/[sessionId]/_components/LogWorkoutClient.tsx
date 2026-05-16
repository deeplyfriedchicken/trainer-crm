"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import {
  LuCheck,
  LuChevronDown,
  LuChevronLeft,
  LuHeart,
  LuPause,
  LuVideo,
  LuX,
} from "react-icons/lu";
import type { PlanForLog } from "@/db/queries/client";
import { BottomSheet } from "@/app/components/BottomSheet";
import { IconButton } from "@/app/components/IconButton";
import { FeedbackModal } from "./FeedbackModal";

interface Props {
  token: string;
  plan: PlanForLog;
  backHref: string;
}

type SetStatus = "pending" | "done" | "cancelled" | "donePaused";
type SetState = { reps: number; weightLbs: number; status: SetStatus };
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

function ScaleButtons({
  value,
  onChange,
  activeClass,
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  activeClass: string;
}) {
  return (
    <div className="pre-scale-buttons">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
        <button
          key={n}
          type="button"
          className={`pre-scale-btn${value === n ? ` ${activeClass}` : ""}`}
          onClick={() => onChange(value === n ? null : n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function PreCheckinProgress({ filled }: { filled: number }) {
  const r = 9;
  const circ = 2 * Math.PI * r;
  const dash = (filled / 3) * circ;
  const isComplete = filled === 3;

  if (isComplete) {
    return (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        className="pre-progress complete"
      >
        <circle cx="11" cy="11" r="10" fill="#4ade80" />
        <path
          d="M7 11l3 3 5-5"
          stroke="#062a10"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="pre-progress">
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke="rgba(167,139,250,0.2)"
        strokeWidth="2.5"
      />
      <circle
        cx="11"
        cy="11"
        r={r}
        fill="none"
        stroke="#a78bfa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 11 11)"
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
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

  // Pre-session check-in
  const [preOpen, setPreOpen] = useState(true);
  const [preEnergy, setPreEnergy] = useState<number | null>(null);
  const [preStress, setPreStress] = useState<number | null>(null);
  const [preSoreness, setPreSoreness] = useState<number | null>(null);
  const preFilled = [preEnergy, preStress, preSoreness].filter(
    (v) => v !== null,
  ).length;

  // Duration countdown
  const cdRef = useRef<{
    exIdx: number;
    setIdx: number;
    remaining: number;
    total: number;
  } | null>(null);
  const [cdState, setCdState] = useState<{
    exIdx: number;
    setIdx: number;
    remaining: number;
    total: number;
  } | null>(null);
  const cdWasPausedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const [log, setLog] = useState<ExerciseLog[]>(() =>
    plan.exercises.map((ex) => ({
      id: ex.id,
      sets: Array.from({ length: ex.sets }, () => ({
        reps: ex.reps ?? ex.durationSeconds ?? 0,
        weightLbs: ex.weightLbs ?? 0,
        status: "pending" as SetStatus,
      })),
    })),
  );

  // Workout elapsed timer
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

  // Duration countdown ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (pausedRef.current) {
        if (cdRef.current) cdWasPausedRef.current = true;
        return;
      }
      if (!cdRef.current) return;

      if (cdRef.current.remaining > 1) {
        cdRef.current.remaining -= 1;
        setCdState({ ...cdRef.current });
      } else {
        const { exIdx, setIdx } = cdRef.current;
        const wasPaused = cdWasPausedRef.current;
        cdRef.current = null;
        cdWasPausedRef.current = false;
        setCdState(null);
        setLog((prev) => {
          const next = prev.map((e) => ({
            ...e,
            sets: e.sets.map((s) => ({ ...s })),
          }));
          next[exIdx].sets[setIdx].status = wasPaused ? "donePaused" : "done";
          return next;
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
    const setEntry = log[exIdx].sets[setIdx];

    // Clicking a completed/cancelled set clears it back to pending
    if (
      setEntry.status === "done" ||
      setEntry.status === "donePaused" ||
      setEntry.status === "cancelled"
    ) {
      setLog((prev) => {
        const next = prev.map((e) => ({
          ...e,
          sets: e.sets.map((s) => ({ ...s })),
        }));
        next[exIdx].sets[setIdx].status = "pending";
        return next;
      });
      return;
    }

    if (ex.type === "duration") {
      const duration = setEntry.reps;
      if (duration <= 0) {
        markDone(exIdx, setIdx, false);
      } else {
        cdRef.current = { exIdx, setIdx, remaining: duration, total: duration };
        cdWasPausedRef.current = false;
        setCdState({ ...cdRef.current });
      }
    } else {
      markDone(exIdx, setIdx, false);
    }
  };

  const markDone = (exIdx: number, setIdx: number, wasPaused: boolean) => {
    setLog((prev) => {
      const next = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      next[exIdx].sets[setIdx].status = wasPaused ? "donePaused" : "done";
      return next;
    });
  };

  const handleCancelTimer = () => {
    if (!cdRef.current) return;
    const { exIdx, setIdx } = cdRef.current;
    cdRef.current = null;
    cdWasPausedRef.current = false;
    setCdState(null);
    setLog((prev) => {
      const next = prev.map((e) => ({
        ...e,
        sets: e.sets.map((s) => ({ ...s })),
      }));
      next[exIdx].sets[setIdx].status = "cancelled";
      return next;
    });
  };

  const fmtDate = new Date(plan.occurredAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const buildSets = () =>
    plan.exercises.flatMap((ex, exIdx) =>
      log[exIdx].sets.map((s, setIdx) => ({
        exerciseId: ex.id,
        position: setIdx,
        ...(ex.type === "duration"
          ? { durationSeconds: s.reps }
          : { reps: s.reps }),
        ...(s.weightLbs > 0 ? { weightLbs: s.weightLbs } : {}),
        completed: s.status === "done" || s.status === "donePaused",
        ...(s.status === "cancelled" ? { cancelled: true } : {}),
        ...(s.status === "donePaused" ? { wasPaused: true } : {}),
      })),
    );

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
            {plan.exercises.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Pre-session check-in */}
        <div className={`pre-checkin${preOpen ? " open" : ""}`}>
          <button
            type="button"
            className="pre-checkin-toggle"
            onClick={() => setPreOpen((o) => !o)}
          >
            <div className="pre-icon">
              <LuHeart size={16} />
            </div>
            <div className="pre-meta">
              <div className="pre-title">Pre-session check-in</div>
              <div className="pre-sub">Optional · How are you feeling today?</div>
            </div>
            <PreCheckinProgress filled={preFilled} />
            <span className="pre-chev">
              <LuChevronDown size={16} />
            </span>
          </button>
          {preOpen && (
            <div className="pre-checkin-body">
              <div className="pre-scale-row">
                <div className="pre-scale-label">
                  Energy
                  <span
                    className={`pre-scale-val${preEnergy === null ? " unset" : ""}`}
                  >
                    {preEnergy !== null ? `${preEnergy} / 10` : "—"}
                  </span>
                </div>
                <ScaleButtons
                  value={preEnergy}
                  onChange={setPreEnergy}
                  activeClass="selected"
                />
                <div className="pre-scale-anchors">
                  <span>
                    <span className="anchor-num">1</span> Dead tired
                  </span>
                  <span>
                    Most energetic <span className="anchor-num">10</span>
                  </span>
                </div>
              </div>
              <div className="pre-scale-row">
                <div className="pre-scale-label">
                  Stress
                  <span
                    className={`pre-scale-val${preStress === null ? " unset" : ""}`}
                  >
                    {preStress !== null ? `${preStress} / 10` : "—"}
                  </span>
                </div>
                <ScaleButtons
                  value={preStress}
                  onChange={setPreStress}
                  activeClass="selected"
                />
                <div className="pre-scale-anchors">
                  <span>
                    <span className="anchor-num">1</span> No stress
                  </span>
                  <span>
                    Most stressful <span className="anchor-num">10</span>
                  </span>
                </div>
              </div>
              <div className="pre-scale-row">
                <div className="pre-scale-label">
                  Soreness
                  <span
                    className={`pre-scale-val${preSoreness === null ? " unset" : ""}`}
                  >
                    {preSoreness !== null ? `${preSoreness} / 10` : "—"}
                  </span>
                </div>
                <ScaleButtons
                  value={preSoreness}
                  onChange={setPreSoreness}
                  activeClass="selected"
                />
                <div className="pre-scale-anchors">
                  <span>
                    <span className="anchor-num">1</span> Not sore
                  </span>
                  <span>
                    Most sore <span className="anchor-num">10</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {plan.exercises.map((ex, exIdx) => {
          const exLog = log[exIdx];
          const completedCount = exLog.sets.filter(
            (s) => s.status === "done" || s.status === "donePaused",
          ).length;
          const isDuration = ex.type === "duration";
          const hasActiveTimer = cdState?.exIdx === exIdx;

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

              {hasActiveTimer ? (
                <div className="log-timer-body">
                  <div
                    className={`log-timer-label${paused ? " paused" : ""}`}
                  >
                    <span className="log-timer-pulse" />
                    {paused ? "Paused" : "Running"}
                  </div>
                  <div
                    className={`log-timer-countdown${paused ? " paused" : ""}`}
                  >
                    {fmtDuration(cdState?.remaining ?? 0)}
                  </div>
                  <div className="log-timer-controls">
                    <button
                      type="button"
                      className="log-timer-btn"
                      onClick={() => setPaused((p) => !p)}
                      title={paused ? "Resume" : "Pause"}
                    >
                      {paused ? <FaPlay size={16} /> : <LuPause size={16} />}
                    </button>
                    <button
                      type="button"
                      className="log-timer-btn cancel"
                      onClick={handleCancelTimer}
                      title="Cancel set"
                    >
                      <LuX size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {ex.comment && (
                    <div className="log-ex-desc">{ex.comment}</div>
                  )}
                  <div className="log-sets-table">
                    {exLog.sets.map((set, setIdx) => {
                      const isDisabled =
                        setIdx > 0 &&
                        exLog.sets[setIdx - 1].status === "pending";
                      const isDone =
                        set.status === "done" || set.status === "donePaused";
                      const isCancelled = set.status === "cancelled";
                      const wasPaused = set.status === "donePaused";

                      let rowClass = "log-set-row";
                      if (isDone) rowClass += " completed";
                      if (isCancelled) rowClass += " status-cancelled";
                      if (isDisabled) rowClass += " disabled";

                      let checkClass = "log-check";
                      if (isDone && !wasPaused) checkClass += " status-done";
                      if (isDone && wasPaused)
                        checkClass += " status-done was-paused";
                      if (isCancelled) checkClass += " status-cancelled";

                      return (
                        <div key={setIdx} className={rowClass}>
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

                          <button
                            type="button"
                            className={checkClass}
                            disabled={isDisabled}
                            onClick={() => handleSetClick(exIdx, setIdx)}
                            aria-label={`Set ${setIdx + 1} ${set.status}`}
                          >
                            {isDone && <LuCheck size={14} strokeWidth={2.5} />}
                            {isCancelled && <LuX size={12} strokeWidth={2.5} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div style={{ height: 100 }} />
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
          sets={buildSets()}
          duration={elapsed}
          preEnergy={preEnergy}
          preStress={preStress}
          preSoreness={preSoreness}
          onCancel={() => setShowFeedback(false)}
        />
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

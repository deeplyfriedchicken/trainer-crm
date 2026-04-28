"use client";

import { useState, useTransition } from "react";
import type { ExerciseLogEntry } from "@/db/queries/workouts";
import { completeWorkout } from "../../../actions";

interface Props {
  token: string;
  planId: string;
  exerciseLogs: ExerciseLogEntry[];
  duration: number;
  onCancel: () => void;
}

function fmtDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function FeedbackModal({ token, planId, exerciseLogs, duration, onCancel }: Props) {
  const [pain, setPain] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError("");
    startTransition(async () => {
      const result = await completeWorkout(token, planId, {
        pain,
        energy,
        comment,
        durationSeconds: duration,
        exerciseLogs,
      });
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="feedback-overlay">
      <div className="feedback-sheet">
        <div className="feedback-header">
          <div className="feedback-title">Session Complete 🎉</div>
          <div className="feedback-sub">
            Duration: {fmtDuration(duration)} · How did it go?
          </div>
        </div>

        <div className="feedback-body">
          <div>
            <div className="fb-section-title">Pain Level</div>
            <div className="scale-btns">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`scale-btn${pain === n ? " active-pain" : ""}`}
                  onClick={() => setPain(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="scale-ends">
              <span>None</span>
              <span>Severe</span>
            </div>
          </div>

          <div>
            <div className="fb-section-title">Energy Level</div>
            <div className="scale-btns">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`scale-btn${energy === n ? " active-energy" : ""}`}
                  onClick={() => setEnergy(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="scale-ends">
              <span>Exhausted</span>
              <span>Feeling great</span>
            </div>
          </div>

          <div>
            <div className="fb-section-title">Notes</div>
            <textarea
              className="fb-textarea"
              placeholder="How did the session feel? Any issues or breakthroughs?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: "var(--red)", fontSize: 13, fontFamily: "var(--font-mono)" }}>
              {error}
            </div>
          )}
        </div>

        <div className="feedback-footer">
          <button
            type="button"
            className="client-btn client-btn-ghost"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={isPending}
          >
            Skip
          </button>
          <button
            type="button"
            className="client-btn client-btn-primary"
            style={{ flex: 2 }}
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving…" : "Save Session"}
          </button>
        </div>
      </div>
    </div>
  );
}

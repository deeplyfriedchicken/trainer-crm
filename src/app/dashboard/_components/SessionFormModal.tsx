"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { LuDumbbell, LuLink, LuPlus, LuX } from "react-icons/lu";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/app/components/Dialog";
import type { SessionEntry } from "@/app/components/SessionsPanel";
import { createSession, updateSession } from "../trainees/[id]/actions";
import { type PickedVideo, VideoPickerModal } from "./VideoPickerModal";
import styles from "./SessionFormModal.module.css";

// ── Schema ────────────────────────────────────────────────────────────────

const exerciseSchema = z.object({
  name: z.string().min(1, "Name required"),
  sets: z.number().int().min(1, "Min 1"),
  reps: z.number().int().min(1, "Min 1"),
  comment: z.string().optional(),
});

const sessionSchema = z.object({
  occurredAt: z.string().min(1, "Date required"),
  comment: z.string().optional(),
  exercises: z.array(exerciseSchema),
});

type FormValues = z.infer<typeof sessionSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────

function toDateInput(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDefaults(session?: SessionEntry | null): FormValues {
  if (!session) return { occurredAt: today(), comment: "", exercises: [] };
  return {
    occurredAt: toDateInput(session.occurredAt),
    comment: session.comment ?? "",
    exercises: session.exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets,
      reps: ex.reps,
      comment: ex.comment ?? "",
    })),
  };
}

function buildInitialVideos(session?: SessionEntry | null): PickedVideo[][] {
  if (!session) return [];
  return session.exercises.map((ex) =>
    (ex.videos ?? []).map((v) => ({ id: v.id, title: v.title, url: v.url })),
  );
}

// ── Component ─────────────────────────────────────────────────────────────

export function SessionFormModal({
  isOpen,
  onClose,
  onSuccess,
  traineeId,
  initialData,
  accentColor = "#FD6DBB",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  traineeId: string;
  initialData?: SessionEntry | null;
  accentColor?: string;
}) {
  const isEdit = !!initialData;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: buildDefaults(initialData),
  });

  const { fields, append, remove } = useFieldArray({ control, name: "exercises" });

  // Per-exercise video lists — parallel to `fields`.
  const [exVideos, setExVideos] = useState<PickedVideo[][]>(() =>
    buildInitialVideos(initialData),
  );

  // Which exercise is the video picker currently open for.
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

  // Reset when initialData changes (create vs. edit toggle).
  useEffect(() => {
    reset(buildDefaults(initialData));
    setExVideos(buildInitialVideos(initialData));
  }, [initialData, reset]);

  // ── Exercise helpers ────────────────────────────────────────────────────

  function addExercise() {
    append({ name: "", sets: 3 as number, reps: 10 as number, comment: "" });
    setExVideos((prev) => [...prev, []]);
  }

  function removeExercise(idx: number) {
    remove(idx);
    setExVideos((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleVideoSelect(video: PickedVideo) {
    if (pickerIdx === null) return;
    setExVideos((prev) => {
      const next = [...prev];
      const current = next[pickerIdx] ?? [];
      if (!current.some((v) => v.id === video.id)) {
        next[pickerIdx] = [...current, video];
      }
      return next;
    });
    setPickerIdx(null);
  }

  function removeVideo(exIdx: number, videoId: string) {
    setExVideos((prev) => {
      const next = [...prev];
      next[exIdx] = (next[exIdx] ?? []).filter((v) => v.id !== videoId);
      return next;
    });
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  async function onSubmit(values: FormValues) {
    const exercises = values.exercises.map((ex, idx) => ({
      name: ex.name,
      sets: Number(ex.sets),
      reps: Number(ex.reps),
      comment: ex.comment || null,
      videoIds: (exVideos[idx] ?? []).map((v) => v.id),
    }));

    try {
      if (isEdit && initialData) {
        await updateSession(initialData.id, {
          occurredAt: new Date(values.occurredAt),
          comment: values.comment || null,
          exercises,
        });
      } else {
        await createSession(traineeId, {
          occurredAt: new Date(values.occurredAt),
          comment: values.comment || null,
          exercises,
        });
      }
      onSuccess();
    } catch {
      setError("root", { message: "Failed to save. Please try again." });
    }
  }

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  const rootError = errors.root?.message;

  return (
    <>
      <Dialog isOpen={isOpen} onClose={handleClose} maxWidth={680}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>
              {isEdit ? "Edit Session" : "New Session"}
            </div>
            <div className={styles.headerSub}>
              {isEdit
                ? "Update session details and exercises"
                : "Log a new coaching session"}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
        >
          <div className={styles.body}>
            {rootError && <div className={styles.errorBanner}>{rootError}</div>}

            {/* Session details */}
            <div>
              <div className={styles.sectionTitle}>Session Details</div>
              <div className={styles.twoCol}>
                <div>
                  <label
                    className={`${styles.fieldLabel}${errors.occurredAt ? ` ${styles.fieldLabelError}` : ""}`}
                  >
                    Date
                    {errors.occurredAt && (
                      <span className={styles.fieldError}>
                        {" "}— {errors.occurredAt.message}
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    {...register("occurredAt")}
                    className={`${styles.input}${errors.occurredAt ? ` ${styles.inputError}` : ""}`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
                <div />
              </div>

              <div style={{ marginTop: 12 }}>
                <label className={styles.fieldLabel}>Notes (optional)</label>
                <textarea
                  {...register("comment")}
                  rows={3}
                  placeholder="Session notes, observations, trainer feedback…"
                  className={styles.textarea}
                />
              </div>
            </div>

            {/* Exercises */}
            <div>
              <div className={styles.sectionTitle}>
                Exercises —{" "}
                {fields.length === 0 ? "none yet" : `${fields.length} added`}
              </div>

              {fields.length > 0 && (
                <div className={styles.exerciseList}>
                  {fields.map((field, idx) => {
                    const exErrors = errors.exercises?.[idx];
                    const linkedVideos = exVideos[idx] ?? [];
                    return (
                      <div key={field.id} className={styles.exerciseCard}>
                        <div className={styles.exerciseCardHeader}>
                          <div className={styles.exerciseCardNum}>
                            Exercise {idx + 1}
                          </div>
                          <button
                            type="button"
                            className={styles.removeExBtn}
                            onClick={() => removeExercise(idx)}
                            aria-label="Remove exercise"
                          >
                            ×
                          </button>
                        </div>

                        {/* Name / Sets / Reps */}
                        <div className={styles.threeCol}>
                          <div>
                            <label
                              className={`${styles.fieldLabel}${exErrors?.name ? ` ${styles.fieldLabelError}` : ""}`}
                            >
                              Name
                              {exErrors?.name && (
                                <span className={styles.fieldError}>
                                  {" "}— {exErrors.name.message}
                                </span>
                              )}
                            </label>
                            <input
                              {...register(`exercises.${idx}.name`)}
                              placeholder="e.g. Squat"
                              className={`${styles.input}${exErrors?.name ? ` ${styles.inputError}` : ""}`}
                            />
                          </div>
                          <div>
                            <label className={styles.fieldLabel}>Sets</label>
                            <input
                              type="number"
                              min={1}
                              {...register(`exercises.${idx}.sets`, {
                                valueAsNumber: true,
                              })}
                              className={`${styles.input}${exErrors?.sets ? ` ${styles.inputError}` : ""}`}
                            />
                          </div>
                          <div>
                            <label className={styles.fieldLabel}>Reps</label>
                            <input
                              type="number"
                              min={1}
                              {...register(`exercises.${idx}.reps`, {
                                valueAsNumber: true,
                              })}
                              className={`${styles.input}${exErrors?.reps ? ` ${styles.inputError}` : ""}`}
                            />
                          </div>
                        </div>

                        {/* Linked videos */}
                        <div style={{ marginBottom: 10 }}>
                          <label className={styles.fieldLabel}>
                            Videos (optional)
                          </label>
                          {linkedVideos.length > 0 && (
                            <div className={styles.videoChips}>
                              {linkedVideos.map((vid) => (
                                <div key={vid.id} className={styles.videoChip}>
                                  <span className={styles.videoChipTitle}>
                                    {vid.title}
                                  </span>
                                  <button
                                    type="button"
                                    className={styles.videoChipRemove}
                                    onClick={() => removeVideo(idx, vid.id)}
                                    aria-label={`Remove ${vid.title}`}
                                  >
                                    <LuX size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            className={styles.linkVideoBtn}
                            onClick={() => setPickerIdx(idx)}
                          >
                            <LuLink size={11} />
                            Link video
                          </button>
                        </div>

                        {/* Exercise notes */}
                        <div>
                          <label className={styles.fieldLabel}>
                            Notes (optional)
                          </label>
                          <textarea
                            {...register(`exercises.${idx}.comment`)}
                            rows={2}
                            placeholder="Cues, modifications, notes for this exercise…"
                            className={styles.textarea}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className={styles.addExBtn}
                style={{ marginTop: fields.length > 0 ? 12 : 0 }}
                onClick={addExercise}
              >
                <LuPlus size={14} />
                Add exercise
              </button>
            </div>
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.saveBtn}
              style={{
                background: accentColor,
                color: "#0a0a1a",
                boxShadow: `0 0 16px ${accentColor}55`,
              }}
            >
              <LuDumbbell size={14} />
              {isSubmitting
                ? "Saving…"
                : isEdit
                  ? "Save Changes"
                  : "Create Session"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Video picker — rendered outside the session dialog so z-index stacks correctly */}
      <VideoPickerModal
        isOpen={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onSelect={handleVideoSelect}
        alreadyLinkedIds={(pickerIdx !== null ? exVideos[pickerIdx] : null)?.map(
          (v) => v.id,
        ) ?? []}
      />
    </>
  );
}

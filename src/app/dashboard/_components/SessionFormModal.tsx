"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { LuDumbbell, LuLink, LuPlus, LuX } from "react-icons/lu";
import { z } from "zod";
import { Dialog } from "@/app/components/Dialog";
import type { SessionEntry } from "@/app/components/SessionsPanel";
import { createPlan, updatePlan } from "../trainees/[id]/actions";
import styles from "./SessionFormModal.module.css";
import { type PickedVideo, VideoPickerModal } from "./VideoPickerModal";

// ── Schema ────────────────────────────────────────────────────────────────

const exerciseSchema = z
  .object({
    name: z.string().min(1, "Name required"),
    type: z.enum(["reps", "duration"]),
    sets: z.number().int().min(1, "Min 1"),
    reps: z.number().int().min(1, "Min 1").optional(),
    durationSeconds: z.number().int().min(1, "Min 1").optional(),
    weightLbs: z.number().min(0).optional(),
    comment: z.string().optional(),
  })
  .refine(
    (d) =>
      (d.type === "reps" && d.reps != null) ||
      (d.type === "duration" && d.durationSeconds != null),
    { message: "Provide reps or duration based on type" },
  );

const sessionSchema = z.object({
  name: z.string().min(1, "Name required"),
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

function defaultName(): string {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildDefaults(session?: SessionEntry | null): FormValues {
  if (!session) return { name: defaultName(), occurredAt: today(), comment: "", exercises: [] };
  return {
    name: session.name ?? defaultName(),
    occurredAt: toDateInput(session.occurredAt),
    comment: session.comment ?? "",
    exercises: session.exercises.map((ex) => ({
      name: ex.name,
      type: ex.type ?? "reps",
      sets: ex.sets,
      reps: ex.reps ?? undefined,
      durationSeconds: ex.durationSeconds ?? undefined,
      weightLbs: ex.weightLbs ?? undefined,
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

// ── Exercise card ─────────────────────────────────────────────────────────

function ExerciseCard({
  idx,
  register,
  control,
  errors,
  onRemove,
  linkedVideos,
  onPickVideo,
  onRemoveVideo,
}: {
  idx: number;
  register: ReturnType<typeof useForm<FormValues>>["register"];
  control: ReturnType<typeof useForm<FormValues>>["control"];
  errors: ReturnType<typeof useForm<FormValues>>["formState"]["errors"];
  onRemove: () => void;
  linkedVideos: PickedVideo[];
  onPickVideo: () => void;
  onRemoveVideo: (videoId: string) => void;
}) {
  const exErrors = errors.exercises?.[idx];
  const type = useWatch({ control, name: `exercises.${idx}.type` }) ?? "reps";

  return (
    <div className={styles.exerciseCard}>
      <div className={styles.exerciseCardHeader}>
        <div className={styles.exerciseCardNum}>Exercise {idx + 1}</div>
        <button
          type="button"
          className={styles.removeExBtn}
          onClick={onRemove}
          aria-label="Remove exercise"
        >
          ×
        </button>
      </div>

      {/* Type toggle */}
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        {(["reps", "duration"] as const).map((t) => (
          <label
            key={t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              color: type === t ? "var(--neon-pink)" : "rgba(255,255,255,0.5)",
            }}
          >
            <input
              type="radio"
              value={t}
              {...register(`exercises.${idx}.type`)}
              style={{ accentColor: "var(--neon-pink)" }}
            />
            {t === "reps" ? "Reps-based" : "Duration-based"}
          </label>
        ))}
      </div>

      {/* Name / Sets / Reps-or-Duration */}
      <div className={styles.threeCol}>
        <div>
          <label
            className={`${styles.fieldLabel}${exErrors?.name ? ` ${styles.fieldLabelError}` : ""}`}
          >
            Name
            {exErrors?.name && (
              <span className={styles.fieldError}>
                {" "}
                — {exErrors.name.message}
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
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : parseInt(v, 10),
                })}
            className={`${styles.input}${exErrors?.sets ? ` ${styles.inputError}` : ""}`}
          />
        </div>
        <div>
          {type === "reps" ? (
            <>
              <label className={styles.fieldLabel}>Reps</label>
              <input
                type="number"
                min={1}
                {...register(`exercises.${idx}.reps`, {
                    setValueAs: (v) =>
                      v === "" || v == null ? undefined : parseInt(v, 10),
                  })}
                className={`${styles.input}${exErrors?.reps ? ` ${styles.inputError}` : ""}`}
              />
            </>
          ) : (
            <>
              <label className={styles.fieldLabel}>Duration (sec)</label>
              <input
                type="number"
                min={1}
                {...register(`exercises.${idx}.durationSeconds`, {
                    setValueAs: (v) =>
                      v === "" || v == null ? undefined : parseInt(v, 10),
                  })}
                className={`${styles.input}${exErrors?.durationSeconds ? ` ${styles.inputError}` : ""}`}
              />
            </>
          )}
        </div>
      </div>

      {/* Weight (optional) */}
      <div style={{ marginBottom: 12 }}>
        <label className={styles.fieldLabel}>Weight, lbs (optional)</label>
        <input
          type="number"
          min={0}
          step={2.5}
          placeholder="e.g. 135"
          {...register(`exercises.${idx}.weightLbs`, {
                  setValueAs: (v) =>
                    v === "" || v == null ? undefined : parseFloat(v),
                })}
          className={styles.input}
          style={{ maxWidth: 140 }}
        />
      </div>

      {/* Linked videos */}
      <div style={{ marginBottom: 10 }}>
        <label className={styles.fieldLabel}>Videos (optional)</label>
        {linkedVideos.length > 0 && (
          <div className={styles.videoChips}>
            {linkedVideos.map((vid) => (
              <div key={vid.id} className={styles.videoChip}>
                <span className={styles.videoChipTitle}>{vid.title}</span>
                <button
                  type="button"
                  className={styles.videoChipRemove}
                  onClick={() => onRemoveVideo(vid.id)}
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
          onClick={onPickVideo}
        >
          <LuLink size={11} />
          Link video
        </button>
      </div>

      {/* Exercise notes */}
      <div>
        <label className={styles.fieldLabel}>Notes (optional)</label>
        <textarea
          {...register(`exercises.${idx}.comment`)}
          rows={2}
          placeholder="Cues, modifications, notes for this exercise…"
          className={styles.textarea}
        />
      </div>
    </div>
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const [exVideos, setExVideos] = useState<PickedVideo[][]>(() =>
    buildInitialVideos(initialData),
  );
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);

  useEffect(() => {
    reset(buildDefaults(initialData));
    setExVideos(buildInitialVideos(initialData));
  }, [initialData, reset]);

  function addExercise() {
    append({
      name: "",
      type: "reps",
      sets: 3 as number,
      reps: 10 as number,
      comment: "",
    });
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

  async function onSubmit(values: FormValues) {
    const exList = values.exercises.map((ex, idx) => ({
      name: ex.name,
      type: ex.type,
      sets: Number(ex.sets),
      reps:
        ex.type === "reps"
          ? ex.reps
            ? Number(ex.reps)
            : undefined
          : undefined,
      durationSeconds:
        ex.type === "duration"
          ? ex.durationSeconds
            ? Number(ex.durationSeconds)
            : undefined
          : undefined,
      weightLbs: ex.weightLbs ? Number(ex.weightLbs) : undefined,
      comment: ex.comment || null,
      videoIds: (exVideos[idx] ?? []).map((v) => v.id),
    }));

    try {
      if (isEdit && initialData) {
        await updatePlan(initialData.id, {
          name: values.name,
          occurredAt: new Date(values.occurredAt),
          comment: values.comment || null,
          exercises: exList,
        });
      } else {
        await createPlan(traineeId, {
          name: values.name,
          occurredAt: new Date(values.occurredAt),
          comment: values.comment || null,
          exercises: exList,
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
        <div className={styles.header}>
          <div>
            <div className={styles.headerTitle}>
              {isEdit ? "Edit Workout Plan" : "New Workout Plan"}
            </div>
            <div className={styles.headerSub}>
              {isEdit
                ? "Update plan details and exercises"
                : "Create a new workout plan for this trainee"}
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
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <div className={styles.body}>
            {rootError && <div className={styles.errorBanner}>{rootError}</div>}

            <div>
              <div className={styles.sectionTitle}>Plan Details</div>
              <div className={styles.twoCol}>
                <div>
                  <label
                    className={`${styles.fieldLabel}${errors.name ? ` ${styles.fieldLabelError}` : ""}`}
                  >
                    Plan Name
                    {errors.name && (
                      <span className={styles.fieldError}> — {errors.name.message}</span>
                    )}
                  </label>
                  <input
                    {...register("name")}
                    placeholder="e.g. Lower Body Power"
                    className={`${styles.input}${errors.name ? ` ${styles.inputError}` : ""}`}
                  />
                </div>
                <div>
                  <label
                    className={`${styles.fieldLabel}${errors.occurredAt ? ` ${styles.fieldLabelError}` : ""}`}
                  >
                    Date
                    {errors.occurredAt && (
                      <span className={styles.fieldError}> — {errors.occurredAt.message}</span>
                    )}
                  </label>
                  <input
                    type="date"
                    {...register("occurredAt")}
                    className={`${styles.input}${errors.occurredAt ? ` ${styles.inputError}` : ""}`}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className={styles.fieldLabel}>Notes (optional)</label>
                <textarea
                  {...register("comment")}
                  rows={3}
                  placeholder="Trainer notes, focus areas, instructions…"
                  className={styles.textarea}
                />
              </div>
            </div>

            <div>
              <div className={styles.sectionTitle}>
                Exercises —{" "}
                {fields.length === 0 ? "none yet" : `${fields.length} added`}
              </div>

              {fields.length > 0 && (
                <div className={styles.exerciseList}>
                  {fields.map((field, idx) => (
                    <ExerciseCard
                      key={field.id}
                      idx={idx}
                      register={register}
                      control={control}
                      errors={errors}
                      onRemove={() => removeExercise(idx)}
                      linkedVideos={exVideos[idx] ?? []}
                      onPickVideo={() => setPickerIdx(idx)}
                      onRemoveVideo={(vid) => removeVideo(idx, vid)}
                    />
                  ))}
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
                  : "Create Plan"}
            </button>
          </div>
        </form>
      </Dialog>

      <VideoPickerModal
        isOpen={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onSelect={handleVideoSelect}
        alreadyLinkedIds={
          (pickerIdx !== null ? exVideos[pickerIdx] : null)?.map((v) => v.id) ??
          []
        }
        traineeId={traineeId}
      />
    </>
  );
}

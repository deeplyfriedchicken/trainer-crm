"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FaPlay } from "react-icons/fa6";
import {
  LuArrowUpFromLine,
  LuChevronLeft,
  LuChevronRight,
  LuDumbbell,
  LuPencil,
  LuPlus,
  LuTrash2,
} from "react-icons/lu";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import type {
  ColorVariant,
  SessionEntry,
} from "@/app/components/SessionsPanel";
import { SessionFormModal } from "@/app/dashboard/_components/SessionFormModal";
import { deleteExercise, publishDraftPlan } from "../actions";

export type PlanExercise = {
  id: string;
  name: string;
  type: "reps" | "duration";
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  weightLbs: number | null;
  comment: string | null;
  videos: { id: string; title: string; url: string }[];
};

export type PlanData = {
  id: string;
  name: string;
  comment: string | null;
  createdAt: Date;
  versionStatus: string;
  publishedAt: Date | null;
  workoutPlanGroupId: string | null;
  exercises: PlanExercise[];
};

function fmtSets(ex: PlanExercise): string {
  if (ex.type === "reps") return `${ex.sets}×${ex.reps ?? "?"}`;
  const dur = ex.durationSeconds ?? 0;
  if (dur >= 60) {
    const m = Math.floor(dur / 60);
    const s = dur % 60;
    return `${ex.sets}×${m}m${s ? `${s}s` : ""}`;
  }
  return `${ex.sets}×${dur}s`;
}

function fmtRel(d: Date | string): string {
  const now = Date.now();
  const diff = now - new Date(d).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 3600);
  if (h < 24) return `${h}h ago`;
  const dy = Math.floor(h / 24);
  if (dy < 7) return `${dy}d ago`;
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function planToSessionEntry(plan: PlanData): SessionEntry {
  return {
    id: plan.id,
    name: plan.name,
    occurredAt: plan.publishedAt ?? plan.createdAt,
    comment: plan.comment,
    exercises: plan.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      type: ex.type,
      sets: ex.sets,
      reps: ex.reps,
      durationSeconds: ex.durationSeconds,
      weightLbs: ex.weightLbs,
      comment: ex.comment,
      videos: ex.videos,
    })),
  } as SessionEntry;
}

type GroupEntry = {
  key: string;
  draft?: PlanData;
  published?: PlanData;
};

export function TraineePlansPanel({
  traineeId,
  plans,
  colorVariant,
}: {
  traineeId: string;
  plans: PlanData[];
  colorVariant: ColorVariant;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SessionEntry | null>(null);
  const [publishTarget, setPublishTarget] = useState<PlanData | null>(null);
  const [planViewMode, setPlanViewMode] = useState<
    Record<string, "draft" | "published">
  >({});
  const [deleteExerciseTarget, setDeleteExerciseTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [videoExercise, setVideoExercise] = useState<PlanExercise | null>(null);
  const [videoIdx, setVideoIdx] = useState(0);

  const accentColor =
    colorVariant === "secondary"
      ? "#34fdfe"
      : colorVariant === "tertiary"
        ? "#4ade80"
        : "#fd6dbb";

  const groupMap = new Map<
    string,
    { draft?: PlanData; published?: PlanData }
  >();
  const ungrouped: PlanData[] = [];

  for (const plan of plans) {
    if (plan.workoutPlanGroupId) {
      const g = groupMap.get(plan.workoutPlanGroupId) ?? {};
      if (plan.versionStatus === "draft") {
        if (!g.draft || new Date(plan.createdAt) > new Date(g.draft.createdAt))
          g.draft = plan;
      } else if (plan.versionStatus === "published") {
        if (
          !g.published ||
          new Date(plan.publishedAt ?? 0) >
            new Date(g.published.publishedAt ?? 0)
        )
          g.published = plan;
      }
      groupMap.set(plan.workoutPlanGroupId, g);
    } else {
      ungrouped.push(plan);
    }
  }

  const entries: GroupEntry[] = [];
  groupMap.forEach((g, key) => {
    if (g.draft || g.published)
      entries.push({ key, draft: g.draft, published: g.published });
  });
  for (const plan of ungrouped)
    entries.push({
      key: plan.id,
      draft: plan.versionStatus === "draft" ? plan : undefined,
      published: plan.versionStatus === "published" ? plan : undefined,
    });

  const visibleCount = entries.length;

  function getVisiblePlan(entry: GroupEntry): PlanData {
    const mode = planViewMode[entry.key] ?? "draft";
    if (mode === "draft") return entry.draft ?? entry.published!;
    return entry.published ?? entry.draft!;
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(plan: PlanData) {
    setEditing(planToSessionEntry(plan));
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditing(null);
  }

  function handleSuccess() {
    handleClose();
    router.refresh();
  }

  function doPublish(plan: PlanData) {
    startTransition(async () => {
      await publishDraftPlan(plan.id, traineeId);
      setPublishTarget(null);
    });
  }

  function doDeleteExercise() {
    if (!deleteExerciseTarget) return;
    startTransition(async () => {
      await deleteExercise(deleteExerciseTarget.id, traineeId);
      setDeleteExerciseTarget(null);
    });
  }

  return (
    <>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Workout Plans
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
              }}
            >
              · {visibleCount}
            </span>
          </div>
          <button
            type="button"
            onClick={openNew}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 8,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}33`,
              color: accentColor,
              fontFamily: "var(--font-body)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <LuPlus size={13} />
            New Plan
          </button>
        </div>

        {/* Plan list */}
        <div style={{ overflowY: "auto", maxHeight: 480, padding: 14 }}>
          {entries.length === 0 && (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
              }}
            >
              No plans yet — create one to get started
            </div>
          )}
          {entries.map((entry) => {
            const plan = getVisiblePlan(entry);
            const isDraft = plan.versionStatus === "draft";
            const isPaired = !!(entry.draft && entry.published);
            const statusColor = isDraft ? "#fb923c" : "#4ade80";
            const mode = planViewMode[entry.key] ?? "draft";

            return (
              <div
                key={entry.key}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${isDraft ? "rgba(251,146,60,0.32)" : "rgba(74,222,128,0.22)"}`,
                  background: isDraft
                    ? "linear-gradient(160deg, rgba(251,146,60,0.06), rgba(255,255,255,0.02))"
                    : "rgba(255,255,255,0.025)",
                }}
              >
                {/* Card header row */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px dashed rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Status pill */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 9px",
                      borderRadius: 999,
                      fontFamily: "var(--font-mono)",
                      fontSize: 9.5,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      background: isDraft
                        ? "rgba(251,146,60,0.13)"
                        : "rgba(74,222,128,0.12)",
                      border: `1px solid ${isDraft ? "rgba(251,146,60,0.35)" : "rgba(74,222,128,0.32)"}`,
                      color: statusColor,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: statusColor,
                        boxShadow: `0 0 6px ${statusColor}`,
                      }}
                    />
                    {isDraft ? "Draft" : "Published"}
                  </span>

                  {/* Version toggle */}
                  {isPaired && (
                    <div
                      style={{
                        display: "inline-flex",
                        padding: 2,
                        borderRadius: 999,
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {(
                        [
                          { k: "published", l: "Published", c: "#4ade80" },
                          { k: "draft", l: "Draft", c: "#fb923c" },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.k}
                          type="button"
                          onClick={() =>
                            setPlanViewMode((m) => ({
                              ...m,
                              [entry.key]: opt.k,
                            }))
                          }
                          style={{
                            background:
                              mode === opt.k
                                ? "rgba(255,255,255,0.08)"
                                : "transparent",
                            border: "none",
                            color:
                              mode === opt.k ? "#fff" : "rgba(255,255,255,0.5)",
                            fontFamily: "var(--font-mono)",
                            fontSize: 9.5,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            padding: "4px 9px",
                            borderRadius: 999,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: opt.c,
                              boxShadow:
                                mode === opt.k ? `0 0 6px ${opt.c}` : "none",
                            }}
                          />
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ flex: 1 }} />
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {isDraft
                      ? `Started ${fmtRel(plan.createdAt)}`
                      : plan.publishedAt
                        ? `Published ${fmtRel(plan.publishedAt)}`
                        : ""}
                  </div>
                </div>

                {/* Title row */}
                <div
                  style={{
                    padding: "12px 14px 8px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      flexShrink: 0,
                      background: isDraft
                        ? "rgba(251,146,60,0.15)"
                        : "rgba(74,222,128,0.12)",
                      border: `1px solid ${isDraft ? "rgba(251,146,60,0.32)" : "rgba(74,222,128,0.3)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: statusColor,
                    }}
                  >
                    <LuDumbbell size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#fff",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.15,
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        color: "rgba(255,255,255,0.45)",
                        marginTop: 4,
                      }}
                    >
                      {plan.exercises.length} exercise
                      {plan.exercises.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Exercise list */}
                <div style={{ padding: "2px 14px 10px" }}>
                  {plan.exercises.map((ex, i) => (
                    <div
                      key={ex.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "7px 0",
                        borderBottom:
                          i === plan.exercises.length - 1
                            ? "none"
                            : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          flexShrink: 0,
                          background: isDraft
                            ? "rgba(251,146,60,0.12)"
                            : "rgba(74,222,128,0.1)",
                          border: `1px solid ${isDraft ? "rgba(251,146,60,0.25)" : "rgba(74,222,128,0.22)"}`,
                          color: statusColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-display)",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.92)",
                          }}
                        >
                          {ex.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 1,
                          }}
                        >
                          {fmtSets(ex)}
                        </div>
                      </div>
                      {ex.videos.length > 0 && (
                        <button
                          type="button"
                          aria-label={`Play videos for ${ex.name}`}
                          onClick={() => {
                            setVideoExercise(ex);
                            setVideoIdx(0);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "4px 9px",
                            borderRadius: 20,
                            background: "rgba(52,253,254,0.1)",
                            border: "1px solid rgba(52,253,254,0.28)",
                            color: "#34fdfe",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          <FaPlay size={8} />
                          {ex.videos.length > 1 && (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: 10,
                                fontWeight: 700,
                                lineHeight: 1,
                              }}
                            >
                              {ex.videos.length}
                            </span>
                          )}
                        </button>
                      )}
                      {isDraft && (
                        <button
                          type="button"
                          aria-label={`Delete ${ex.name}`}
                          onClick={() =>
                            setDeleteExerciseTarget({
                              id: ex.id,
                              name: ex.name,
                            })
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "rgba(248,113,113,0.45)",
                            padding: 4,
                            borderRadius: 6,
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                          }}
                        >
                          <LuTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Footer actions */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(0,0,0,0.18)",
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      padding: "7px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <LuPencil size={12} />
                    Edit
                  </button>
                  {isDraft && (
                    <button
                      type="button"
                      onClick={() => setPublishTarget(plan)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        padding: "7px 12px",
                        borderRadius: 8,
                        background: "rgba(74,222,128,0.13)",
                        border: "1px solid rgba(74,222,128,0.35)",
                        color: "#4ade80",
                        fontFamily: "var(--font-body)",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <LuArrowUpFromLine size={12} />
                      Publish…
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SessionFormModal
        isOpen={modalOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
        traineeId={traineeId}
        initialData={editing}
        colorVariant={colorVariant}
      />

      {/* Publish confirm modal */}
      {publishTarget && (
        <div
          onClick={() => !isPending && setPublishTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              background: "rgba(20,18,40,0.98)",
              border: "1px solid rgba(74,222,128,0.32)",
              borderRadius: 16,
              padding: "24px 22px 18px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: "rgba(74,222,128,0.13)",
                border: "1px solid rgba(74,222,128,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                color: "#4ade80",
              }}
            >
              <LuArrowUpFromLine size={24} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Publish this draft?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.55,
                marginBottom: 18,
              }}
            >
              Publishing makes{" "}
              <strong style={{ color: "#fff" }}>"{publishTarget.name}"</strong>{" "}
              visible to the trainee as their active plan.
            </div>
            <div
              style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                textAlign: "left",
              }}
            >
              {(
                [
                  ["Plan", publishTarget.name, false],
                  ["Exercises", String(publishTarget.exercises.length), false],
                  ["Status", "", true],
                ] as const
              ).map(([label, value, isStatus]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "3px 0",
                  }}
                >
                  <span
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </span>
                  {isStatus ? (
                    <span>
                      <span style={{ color: "#fb923c", fontWeight: 600 }}>
                        Draft
                      </span>
                      <span
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          padding: "0 6px",
                        }}
                      >
                        →
                      </span>
                      <span style={{ color: "#4ade80", fontWeight: 600 }}>
                        Published
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 600 }}>
                      {value}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setPublishTarget(null)}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                Keep as draft
              </button>
              <button
                type="button"
                onClick={() => doPublish(publishTarget)}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  border: "none",
                  color: "#052e10",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                  boxShadow: "0 6px 20px rgba(74,222,128,0.32)",
                }}
              >
                {isPending ? "Publishing…" : "Publish now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete exercise confirm modal */}
      {deleteExerciseTarget && (
        <div
          onClick={() => !isPending && setDeleteExerciseTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              background: "rgba(20,18,40,0.98)",
              border: "1px solid rgba(248,113,113,0.32)",
              borderRadius: 16,
              padding: "24px 22px 18px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                color: "#f87171",
              }}
            >
              <LuTrash2 size={20} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 800,
                color: "#fff",
                marginBottom: 8,
              }}
            >
              Delete exercise?
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.55,
                marginBottom: 20,
              }}
            >
              <strong style={{ color: "#fff" }}>
                "{deleteExerciseTarget.name}"
              </strong>{" "}
              will be removed from this draft plan. This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteExerciseTarget(null)}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isPending ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDeleteExercise}
                disabled={isPending}
                style={{
                  flex: 1,
                  padding: 11,
                  borderRadius: 10,
                  background: "rgba(248,113,113,0.18)",
                  border: "1px solid rgba(248,113,113,0.45)",
                  color: "#f87171",
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isPending ? "not-allowed" : "pointer",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise video gallery modal */}
      {videoExercise && (() => {
        const videos = videoExercise.videos;
        const current = videos[videoIdx];
        const total = videos.length;
        if (!current) return null;
        return (
          <Dialog isOpen onClose={() => setVideoExercise(null)} maxWidth={880}>
            <video
              key={current.url}
              src={current.url}
              controls
              autoPlay
              style={{
                width: "100%",
                display: "block",
                maxHeight: "52vh",
                background: "#000",
              }}
            />
            <DialogBody>
              {total > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setVideoIdx((i) => Math.max(0, i - 1))}
                    disabled={videoIdx === 0}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      color: videoIdx === 0 ? "rgba(255,255,255,0.2)" : "#fff",
                      cursor: videoIdx === 0 ? "not-allowed" : "pointer",
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LuChevronLeft size={16} />
                  </button>

                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {videos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setVideoIdx(i)}
                        aria-label={`Video ${i + 1}`}
                        style={{
                          width: i === videoIdx ? 18 : 7,
                          height: 7,
                          borderRadius: 999,
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          background:
                            i === videoIdx
                              ? accentColor
                              : "rgba(255,255,255,0.2)",
                          transition: "width 0.2s, background 0.2s",
                          boxShadow:
                            i === videoIdx ? `0 0 8px ${accentColor}80` : "none",
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVideoIdx((i) => Math.min(total - 1, i + 1))
                    }
                    disabled={videoIdx === total - 1}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 8,
                      color:
                        videoIdx === total - 1
                          ? "rgba(255,255,255,0.2)"
                          : "#fff",
                      cursor:
                        videoIdx === total - 1 ? "not-allowed" : "pointer",
                      padding: "4px 8px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <LuChevronRight size={16} />
                  </button>

                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      minWidth: 32,
                    }}
                  >
                    {videoIdx + 1}/{total}
                  </span>
                </div>
              )}

              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 4,
                }}
              >
                {videoExercise.name}
              </div>
              {current.title && (
                <div
                  style={{
                    fontSize: 12,
                    color: accentColor,
                    opacity: 0.75,
                  }}
                >
                  {current.title}
                </div>
              )}
            </DialogBody>
          </Dialog>
        );
      })()}
    </>
  );
}

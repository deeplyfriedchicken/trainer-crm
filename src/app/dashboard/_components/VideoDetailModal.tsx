"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  LuCalendar,
  LuClock,
  LuExternalLink,
  LuFileVideo,
  LuHardDrive,
  LuPencil,
  LuTrash2,
  LuUser,
} from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import { Skeleton } from "@/app/components/Skeleton";
import { Textarea } from "@/app/components/Textarea";
import { updateVideoMetadata } from "@/app/dashboard/videos/actions";
import { usePermissions } from "@/app/dashboard/_hooks/usePermissions";

type VideoDetail = {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileSizeBytes: number;
  durationSeconds: number | null;
  createdAt: string;
  deletedAt: string | null;
  uploader: { id: string; name: string };
  trainee: { id: string; name: string } | null;
  videoTags: { tag: { id: string; name: string } }[];
  exerciseLinks: {
    exercise: {
      id: string;
      name: string;
      workoutPlan: { id: string; name: string } | null;
    };
  }[];
  workoutPlanLinks: {
    workoutPlan: { id: string; name: string; traineeId: string };
  }[];
};

const TAG_COLORS = ["#FD6DBB", "#34FDFE", "#a78bfa", "#4ade80", "#fb923c"];
const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB", B: "#34FDFE", C: "#a78bfa", D: "#4ade80", E: "#fb923c",
  F: "#FD6DBB", G: "#34FDFE", H: "#a78bfa", I: "#4ade80", J: "#FD6DBB",
  K: "#34FDFE", L: "#a78bfa", M: "#4ade80", N: "#fb923c", O: "#FD6DBB",
  P: "#34FDFE", Q: "#a78bfa", R: "#4ade80", S: "#FD6DBB", T: "#34FDFE",
  U: "#a78bfa", V: "#4ade80", W: "#fb923c", X: "#FD6DBB", Y: "#34FDFE",
  Z: "#a78bfa",
};

function tagColor(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_COLORS[sum % TAG_COLORS.length];
}

function uploaderColor(name: string): string {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

function MetaRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div style={{
        display: "flex", alignItems: "center", gap: 5,
        color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4,
      }}>
        {icon}{label}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
        {children}
      </div>
    </>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, textTransform: "uppercase",
      letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", marginBottom: 6,
    }}>
      {children}
    </div>
  );
}

function TagChipInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addTag(raw: string) {
    const name = raw.trim().toLowerCase();
    if (name && !tags.includes(name)) onChange([...tags, name]);
    setInput("");
  }

  function removeTag(name: string) {
    onChange(tags.filter((t) => t !== name));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      style={{
        display: "flex", flexWrap: "wrap", gap: 6, padding: "6px 10px",
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8, alignItems: "center", minHeight: 38, cursor: "text",
      }}
      onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}
    >
      {tags.map((tag) => {
        const c = tagColor(tag);
        return (
          <span
            key={tag}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              background: `${c}22`, color: c, border: `1px solid ${c}44`,
              borderRadius: 20, padding: "2px 6px 2px 10px",
              fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: c, padding: "0 2px", display: "inline-flex", alignItems: "center",
                lineHeight: 1, fontSize: 15, opacity: 0.7,
              }}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        );
      })}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? "Add tags — Enter or comma to add" : ""}
        style={{
          background: "none", border: "none", outline: "none",
          color: "#fff", fontSize: 12, flex: 1, minWidth: 100, padding: "2px 0",
        }}
      />
    </div>
  );
}

export function VideoDetailModal({
  videoId,
  fileUrl,
  initialTitle,
  onClose,
  onDelete,
}: {
  videoId: string;
  fileUrl: string;
  initialTitle: string;
  onClose: () => void;
  onDelete?: () => Promise<void>;
}) {
  const { canDeleteVideo, canEditVideo } = usePermissions();
  const router = useRouter();
  const [detail, setDetail] = useState<VideoDetail | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function fetchDetail() {
    fetch(`/api/videos/${videoId}`)
      .then((r) => r.json())
      .then(({ data }) => setDetail(data as VideoDetail))
      .catch(() => {});
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/videos/${videoId}`)
      .then((r) => r.json())
      .then(({ data }) => { if (!cancelled) setDetail(data as VideoDetail); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [videoId]);

  function startEdit() {
    if (!detail) return;
    setEditTitle(detail.title);
    setEditDescription(detail.description ?? "");
    setEditTags(detail.videoTags.map((vt) => vt.tag.name));
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updateVideoMetadata(videoId, {
        title: editTitle.trim() || initialTitle,
        description: editDescription.trim() || null,
        tagNames: editTags,
      });
      setIsEditing(false);
      fetchDetail();
      router.refresh();
    });
  }

  const showDelete = canDeleteVideo && !!onDelete && !detail?.deletedAt;

  const editBtn = canEditVideo && detail && !detail.deletedAt && !isEditing ? (
    <button
      type="button"
      onClick={startEdit}
      aria-label="Edit video"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px", borderRadius: 8, cursor: "pointer",
        background: "rgba(52,253,254,0.08)",
        border: "1px solid rgba(52,253,254,0.2)",
        color: "#34FDFE", fontSize: 12, fontWeight: 600,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,253,254,0.15)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(52,253,254,0.08)"; }}
    >
      <LuPencil size={13} />
      Edit
    </button>
  ) : null;

  const deleteBtn = showDelete && !isEditing ? (
    <button
      type="button"
      onClick={() => setConfirmDelete(true)}
      aria-label="Delete video"
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px", borderRadius: 8, cursor: "pointer",
        background: "rgba(248,113,113,0.1)",
        border: "1px solid rgba(248,113,113,0.25)",
        color: "#f87171", fontSize: 12, fontWeight: 600,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.18)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.1)"; }}
    >
      <LuTrash2 size={13} />
      Delete
    </button>
  ) : null;

  const titleAction = (editBtn || deleteBtn) ? (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {editBtn}
      {deleteBtn}
    </div>
  ) : null;

  const trainee = detail?.trainee ?? null;
  const exercise = detail?.exerciseLinks[0]?.exercise ?? null;
  const plan = exercise?.workoutPlan ?? detail?.workoutPlanLinks[0]?.workoutPlan ?? null;
  const uploaderCol = detail ? uploaderColor(detail.uploader.name) : "#FD6DBB";

  return (
    <>
      <Dialog
        isOpen
        onClose={onClose}
        title={detail?.title ?? initialTitle}
        titleAction={titleAction}
        maxWidth={900}
      >
        <video
          key={videoId}
          src={fileUrl}
          controls
          autoPlay
          style={{ width: "100%", display: "block", maxHeight: "52vh", background: "#000" }}
        >
          <track kind="captions" srcLang="en" label="English" src="data:text/vtt;charset=utf-8,WEBVTT" default />
        </video>

        <DialogBody>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Title */}
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: "100%", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                    padding: "8px 12px", color: "#fff", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(52,253,254,0.4)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                />
              </div>

              {/* Tags */}
              <div>
                <FieldLabel>Tags</FieldLabel>
                <TagChipInput tags={editTags} onChange={setEditTags} />
              </div>

              {/* Description */}
              <div>
                <FieldLabel>Description</FieldLabel>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional description…"
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <Button
                  variant="ghost"
                  colorScheme="cyan"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  colorScheme="pink"
                  size="sm"
                  loading={isPending}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Tags */}
              {detail ? (
                detail.videoTags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                    {detail.videoTags.map(({ tag }) => {
                      const c = tagColor(tag.name);
                      return (
                        <span key={tag.id} style={{
                          background: `${c}22`, color: c, border: `1px solid ${c}44`,
                          borderRadius: 20, padding: "2px 10px", fontSize: 11,
                          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                )
              ) : (
                <Skeleton style={{ height: 24, width: 120, borderRadius: 20, marginBottom: 14 }} />
              )}

              {/* Description */}
              {detail?.description && (
                <p style={{
                  fontSize: 13, color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.6, marginBottom: 18,
                }}>
                  {detail.description}
                </p>
              )}

              {/* Context: trainee + exercise/plan */}
              {(detail ? (trainee || exercise || plan) : true) && (
                <div style={{
                  marginBottom: 18, padding: "12px 14px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {detail ? (
                    <>
                      {trainee && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", width: 64, flexShrink: 0 }}>Trainee</span>
                          <Link
                            href={`/dashboard/trainees/${trainee.id}`}
                            style={{ color: "var(--neon-cyan)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}
                            onClick={onClose}
                          >
                            {trainee.name}
                            <LuExternalLink size={12} />
                          </Link>
                        </div>
                      )}
                      {exercise && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", width: 64, flexShrink: 0 }}>Exercise</span>
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>{exercise.name}</span>
                        </div>
                      )}
                      {plan && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", width: 64, flexShrink: 0 }}>Plan</span>
                          <span style={{ color: "rgba(255,255,255,0.7)" }}>{plan.name}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Skeleton style={{ height: 18, width: "60%", borderRadius: 6 }} />
                      <Skeleton style={{ height: 18, width: "40%", borderRadius: 6 }} />
                    </>
                  )}
                </div>
              )}

              {/* Metadata grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px" }}>
                {detail ? (
                  <>
                    <MetaRow icon={<LuUser size={13} />} label="Uploaded by">
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                          background: `${uploaderCol}22`, border: `1px solid ${uploaderCol}55`, color: uploaderCol,
                        }}>
                          {detail.uploader.name[0]?.toUpperCase()}
                        </div>
                        {detail.uploader.name}
                      </div>
                    </MetaRow>
                    <MetaRow icon={<LuCalendar size={13} />} label="Uploaded">
                      {formatDate(detail.createdAt)}
                    </MetaRow>
                    {detail.durationSeconds != null && (
                      <MetaRow icon={<LuClock size={13} />} label="Duration">
                        {formatDuration(detail.durationSeconds)}
                      </MetaRow>
                    )}
                    <MetaRow icon={<LuHardDrive size={13} />} label="File size">
                      {formatFileSize(detail.fileSizeBytes)}
                    </MetaRow>
                    <MetaRow icon={<LuFileVideo size={13} />} label="File">
                      {detail.fileName}
                    </MetaRow>
                  </>
                ) : (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} style={{ height: 36, borderRadius: 6 }} />
                  ))
                )}
              </div>
            </>
          )}
        </DialogBody>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete Video"
        maxWidth={440}
      >
        <DialogBody>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.65)",
            marginBottom: 20, lineHeight: 1.6,
          }}>
            Are you sure you want to delete{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>
              {detail?.title ?? initialTitle}
            </span>
            ? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Button
              variant="ghost"
              colorScheme="cyan"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              colorScheme="pink"
              size="sm"
              loading={isPending}
              onClick={() => {
                if (!onDelete) return;
                startTransition(async () => {
                  await onDelete();
                  setConfirmDelete(false);
                  onClose();
                });
              }}
            >
              <LuTrash2 size={13} />
              Delete
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

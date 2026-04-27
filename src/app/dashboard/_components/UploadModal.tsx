"use client";

import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { LuFilm, LuUpload } from "react-icons/lu";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@/app/components/Dialog";
import styles from "./UploadModal.module.css";

// ── Types ──────────────────────────────────────────────────────────────────

type Tag = { id: string; name: string };

const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z
    .string()
    .refine((v) => v === "" || v.length >= 10, "Min 10 characters if provided"),
  tagIds: z.array(z.string()).min(1, "Select at least one tag"),
});

const formSchema = z.object({
  entries: z.array(entrySchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;
type Phase = "form" | "uploading" | "success";

// ── Helpers ────────────────────────────────────────────────────────────────

function sanitizeTitle(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TagPicker({
  allTags,
  selectedIds,
  onChange,
  hasError,
}: {
  allTags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  hasError: boolean;
}) {
  const [newTagInput, setNewTagInput] = useState("");

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((x) => x !== id)
        : [...selectedIds, id],
    );
  }

  async function createTag(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return;
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    const json = await res.json();
    const tag: Tag = json.data;
    // add to selection; the allTags list will refresh on next open
    if (!selectedIds.includes(tag.id)) {
      onChange([...selectedIds, tag.id]);
    }
    // optimistically add to the shown pills if not already present
    if (!allTags.some((t) => t.id === tag.id)) {
      allTags.push(tag);
    }
    setNewTagInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      createTag(newTagInput);
    }
  }

  return (
    <div className={styles.tagPills}>
      {allTags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggle(tag.id)}
            className={`${styles.tagPill}${selected ? ` ${styles.tagPillSelected}` : ""}${!selected && hasError ? ` ${styles.tagPillError}` : ""}`}
          >
            {selected && <span style={{ marginRight: 3, fontSize: 9 }}>✓</span>}
            {tag.name}
          </button>
        );
      })}
      <input
        className={styles.newTagInput}
        value={newTagInput}
        onChange={(e) => setNewTagInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => newTagInput.trim() && createTag(newTagInput)}
        placeholder="+ new tag"
        aria-label="Create new tag"
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function UploadModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("form");
  const [perFileProgress, setPerFileProgress] = useState<Record<number, number>>({});
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { entries: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "entries" });

  // Fetch available tags when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/tags")
      .then((r) => r.json())
      .then((j) => setAllTags(j.data ?? []));
  }, [isOpen]);

  // beforeunload warning during upload
  useEffect(() => {
    if (phase !== "uploading") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const [isUploading, setIsUploading] = useState(false);

  function addFiles(files: File[]) {
    setDroppedFiles((prev) => [...prev, ...files]);
    for (const f of files) {
      append({ title: sanitizeTitle(f.name), description: "", tagIds: [] });
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("video/"),
    );
    if (files.length) addFiles(files);
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addFiles(files);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setDroppedFiles((prev) => prev.filter((_, i) => i !== idx));
    remove(idx);
  }

  function handleClose() {
    if (phase === "uploading") return; // block close during upload
    reset();
    setDroppedFiles([]);
    setPhase("form");
    setPerFileProgress({});
    onClose();
  }

  function handleSuccess() {
    handleClose();
    onSuccess();
  }

  function handleUploadMore() {
    reset();
    setDroppedFiles([]);
    setPhase("form");
    setPerFileProgress({});
  }

  async function startActualUpload() {
    if (droppedFiles.length === 0) return;
    setPhase("uploading");
    setIsUploading(true);
    const values = watch("entries");
    try {
      const videoIds: string[] = [];
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        // 1. Get presigned URL + create DB record
        const presignRes = await fetch("/api/videos/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileSizeBytes: file.size,
          }),
        });
        const { videoId, uploadUrl } = await presignRes.json();
        videoIds.push(videoId);
        // 2. Upload directly to S3 via XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setPerFileProgress((prev) => ({ ...prev, [i]: Math.round((e.loaded / e.total) * 100) }));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`S3 upload failed: ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("S3 upload network error")));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
        setPerFileProgress((prev) => ({ ...prev, [i]: 100 }));
      }
      // 3. Save metadata for each video
      await Promise.all(
        videoIds.map(async (videoId, i) => {
          const entry = values[i];
          if (!entry) return;
          await fetch(`/api/videos/${videoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: entry.title,
              description: entry.description || undefined,
              tagIds: entry.tagIds,
            }),
          });
        }),
      );
      setPhase("success");
    } catch {
      setPhase("form");
    } finally {
      setIsUploading(false);
    }
  }

  const hasErrors = Object.keys(errors.entries ?? {}).length > 0;

  const headerSubtitle =
    phase === "form"
      ? fields.length
        ? `${fields.length} video${fields.length > 1 ? "s" : ""} queued`
        : "Drag & drop or browse to add videos"
      : phase === "uploading"
        ? `Uploading ${fields.length} video${fields.length > 1 ? "s" : ""}…`
        : "Upload complete!";

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} maxWidth={740}>
      {/* Custom header (Dialog's built-in doesn't support subtitle) */}
      <div className={styles.customHeader}>
        <div>
          <div className={styles.customHeaderTitle}>Upload Videos</div>
          <div className={styles.customHeaderSub}>{headerSubtitle}</div>
        </div>
        <button
          type="button"
          className={styles.customCloseBtn}
          onClick={handleClose}
          disabled={phase === "uploading"}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Success */}
      {phase === "success" && (
        <div className={styles.body} style={{ justifyContent: "center", alignItems: "center" }}>
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <div>
              <div className={styles.successTitle}>
                {fields.length} Video{fields.length > 1 ? "s" : ""} Uploaded!
              </div>
              <div className={styles.successSub}>
                Your videos are now available in the library and can be assigned to trainees.
              </div>
            </div>
            <div className={styles.successActions}>
              <button
                type="button"
                onClick={handleSuccess}
                style={{
                  padding: "9px 22px", borderRadius: 10, background: "#4ade80",
                  border: "none", color: "#001a0a", fontFamily: "var(--font-neon-body)",
                  fontSize: 13, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 0 16px rgba(74,222,128,0.4)",
                }}
              >
                Done
              </button>
              <button
                type="button"
                onClick={handleUploadMore}
                style={{
                  padding: "9px 22px", borderRadius: 10, background: "transparent",
                  border: "1px solid rgba(52,253,254,0.4)", color: "var(--neon-cyan)",
                  fontFamily: "var(--font-neon-body)", fontSize: 13, fontWeight: 700, cursor: "pointer",
                }}
              >
                Upload More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading */}
      {phase === "uploading" && (
        <div className={styles.body} style={{ justifyContent: "center" }}>
          <div className={styles.uploadingList}>
            {droppedFiles.map((f, i) => {
              const pct = perFileProgress[i] ?? 0;
              const entry = watch(`entries.${i}`);
              return (
                <div key={f.name + i} className={styles.uploadingRow}>
                  <div className={styles.fileIcon}>
                    <LuFilm size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={styles.uploadingTitle}>
                      {entry?.title || f.name}
                    </div>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressBar} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className={styles.uploadPercent}>{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      {phase === "form" && (
        <form
          onSubmit={handleSubmit(startActualUpload)}
          style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
        >
          <div className={styles.body}>
            {/* Drop zone */}
            <div
              className={`${styles.dropZone}${dragging ? ` ${styles.dropZoneDragging}` : ""}${fields.length > 0 ? ` ${styles.dropZoneHasFiles}` : ""}`}
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                multiple
                onChange={handleBrowse}
                style={{ display: "none" }}
              />
              <LuUpload
                size={36}
                color={dragging ? "var(--neon-cyan)" : "rgba(52,253,254,0.5)"}
                style={{ margin: "0 auto 10px" }}
              />
              <div className={`${styles.dropLabel}${dragging ? ` ${styles.dropLabelActive}` : ""}`}>
                {dragging ? "Drop to add videos" : "Drag & drop videos here"}
              </div>
              <div className={styles.dropSub}>
                or{" "}
                <span className={styles.dropBrowseLink}>browse files</span>
                {" "}· MP4, MOV, AVI supported
              </div>
            </div>

            {/* Error banner */}
            {hasErrors && (
              <div className={styles.errorBanner}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                </svg>
                <div>
                  <div className={styles.errorBannerTitle}>Please fix the errors below before uploading.</div>
                  <div className={styles.errorBannerSub}>Every video needs a title and at least one tag.</div>
                </div>
              </div>
            )}

            {/* File cards */}
            {fields.length > 0 && (
              <div className={styles.fileList}>
                {fields.map((field, idx) => {
                  const entryErrors = errors.entries?.[idx];
                  const titleError = entryErrors?.title?.message;
                  const tagError = entryErrors?.tagIds?.message;
                  const descError = entryErrors?.description?.message;
                  const hasCardError = !!(titleError || tagError || descError);
                  const selectedTagIds = watch(`entries.${idx}.tagIds`) ?? [];

                  return (
                    <div
                      key={field.id}
                      className={`${styles.fileCard}${hasCardError ? ` ${styles.fileCardError}` : ""}`}
                    >
                      <div className={styles.fileCardHeader}>
                        <div className={styles.fileIcon}><LuFilm size={18} /></div>
                        <div className={styles.fileInfo}>
                          <div className={styles.fileName}>
                            {droppedFiles[idx]?.name ?? ""}
                          </div>
                          <div className={styles.fileIndex}>
                            Video {idx + 1} of {fields.length}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeBtn}
                          onClick={() => removeFile(idx)}
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>

                      <div className={styles.fieldGrid}>
                        {/* Title */}
                        <div>
                          <label className={`${styles.fieldLabel}${titleError ? ` ${styles.fieldLabelError}` : ""}`}>
                            Title{titleError && <span className={styles.fieldError}> — {titleError}</span>}
                          </label>
                          <input
                            {...register(`entries.${idx}.title`)}
                            placeholder="e.g. Full Body HIIT Blast"
                            className={`${styles.input}${titleError ? ` ${styles.inputError}` : ""}`}
                          />
                        </div>

                        {/* Tags */}
                        <div>
                          <label className={`${styles.fieldLabel}${tagError ? ` ${styles.fieldLabelError}` : ""}`}>
                            Tags{tagError && <span className={styles.fieldError}> — {tagError}</span>}
                          </label>
                          <TagPicker
                            allTags={allTags}
                            selectedIds={selectedTagIds}
                            onChange={(ids) => setValue(`entries.${idx}.tagIds`, ids, { shouldValidate: true })}
                            hasError={!!tagError}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className={`${styles.fieldLabel}${descError ? ` ${styles.fieldLabelError}` : ""}`}>
                          Description{" "}
                          <span style={{ fontWeight: 400, textTransform: "none", color: "rgba(255,255,255,0.25)", letterSpacing: 0 }}>
                            (optional, min 10 chars if provided)
                          </span>
                          {descError && <span className={styles.fieldError}> — {descError}</span>}
                        </label>
                        <textarea
                          {...register(`entries.${idx}.description`)}
                          rows={2}
                          placeholder="Briefly describe this video's focus, intensity level, or target muscle groups…"
                          className={`${styles.textarea}${descError ? ` ${styles.inputError}` : ""}`}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Add more */}
                <button
                  type="button"
                  className={styles.addMoreBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add more videos
                </button>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerCount}>
              {fields.length ? `${fields.length} file${fields.length > 1 ? "s" : ""} queued` : "No files selected"}
            </div>
            <div className={styles.footerActions}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: "8px 18px", borderRadius: 10, background: "transparent",
                  border: "none", color: "rgba(255,255,255,0.5)",
                  fontFamily: "var(--font-neon-body)", fontSize: 13, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || fields.length === 0}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "9px 22px", borderRadius: 10,
                  background: "var(--neon-cyan)", border: "none",
                  color: "#001a1a", fontFamily: "var(--font-neon-body)",
                  fontSize: 13, fontWeight: 700, cursor: fields.length ? "pointer" : "not-allowed",
                  opacity: fields.length ? 1 : 0.4,
                  boxShadow: fields.length ? "0 0 14px rgba(52,253,254,0.4)" : "none",
                }}
              >
                <LuUpload size={14} />
                Upload {fields.length > 0 ? `${fields.length} Video${fields.length > 1 ? "s" : ""}` : "Videos"}
              </button>
            </div>
          </div>
        </form>
      )}
    </Dialog>
  );
}

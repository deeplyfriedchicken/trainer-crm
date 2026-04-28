"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { LuFilm, LuSearch, LuUpload, LuX } from "react-icons/lu";
import { Dialog } from "@/app/components/Dialog";
import styles from "./VideoPickerModal.module.css";

// ── Types ─────────────────────────────────────────────────────────────────

export type PickedVideo = { id: string; title: string; url: string };

type ApiVideo = {
  id: string;
  title: string;
  fileUrl: string;
  durationSeconds: number | null;
};

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtDuration(s: number | null): string | null {
  if (s === null) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function sanitizeTitle(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
}

// ── Thumbnail (lightweight video preview) ────────────────────────────────

function PickerThumb({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={() => {
        const v = ref.current;
        if (v) v.currentTime = Math.min(1, v.duration * 0.1);
      }}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────

const PAGE_SIZE = 12;
type UploadPhase = "idle" | "uploading" | "done";

export function VideoPickerModal({
  isOpen,
  onClose,
  onSelect,
  alreadyLinkedIds = [],
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (video: PickedVideo) => void;
  alreadyLinkedIds?: string[];
}) {
  // ── Library state ─────────────────────────────────────────────────────
  const [view, setView] = useState<"library" | "upload">("library");
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Upload state ──────────────────────────────────────────────────────
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitles, setUploadTitles] = useState<string[]>([]);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [dragging, setDragging] = useState(false);
  const [titleErrors, setTitleErrors] = useState<boolean[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounce the search input.
  function handleQueryChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setCommittedQuery(value);
      setOffset(0);
      setVideos([]);
    }, 320);
  }

  // Fetch whenever committed query, offset, or refreshKey changes.
  useEffect(() => {
    if (!isOpen || view !== "library") return;
    setLoading(true);
    const params = new URLSearchParams({
      limit: String(PAGE_SIZE),
      offset: String(offset),
      status: "ready",
    });
    if (committedQuery) params.set("q", committedQuery);

    fetch(`/api/videos?${params}`)
      .then((r) => r.json())
      .then((json: { data: ApiVideo[]; pagination: { limit: number; offset: number } }) => {
        const fetched = json.data ?? [];
        setVideos((prev) => (offset === 0 ? fetched : [...prev, ...fetched]));
        setHasMore(fetched.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, view, committedQuery, offset, refreshKey]);

  // Reset all state when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setView("library");
      setQuery("");
      setCommittedQuery("");
      setOffset(0);
      setVideos([]);
      setHasMore(false);
      resetUpload();
    }
  }, [isOpen]);

  function loadMore() {
    setOffset((prev) => prev + PAGE_SIZE);
  }

  // ── Upload helpers ────────────────────────────────────────────────────

  function resetUpload() {
    setUploadFiles([]);
    setUploadTitles([]);
    setUploadPhase("idle");
    setUploadProgress({});
    setDragging(false);
    setTitleErrors([]);
  }

  function addFiles(files: File[]) {
    const videoFiles = files.filter((f) => f.type.startsWith("video/"));
    if (!videoFiles.length) return;
    setUploadFiles((prev) => [...prev, ...videoFiles]);
    setUploadTitles((prev) => [...prev, ...videoFiles.map((f) => sanitizeTitle(f.name))]);
    setTitleErrors((prev) => [...prev, ...videoFiles.map(() => false)]);
  }

  function removeUploadFile(idx: number) {
    setUploadFiles((prev) => prev.filter((_, i) => i !== idx));
    setUploadTitles((prev) => prev.filter((_, i) => i !== idx));
    setTitleErrors((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleBrowse(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  }

  async function startUpload() {
    const errors = uploadTitles.map((t) => !t.trim());
    setTitleErrors(errors);
    if (errors.some(Boolean)) return;

    setUploadPhase("uploading");
    try {
      const videoIds: string[] = [];
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
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
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setUploadProgress((prev) => ({
                ...prev,
                [i]: Math.round((e.loaded / e.total) * 100),
              }));
            }
          });
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
          });
          xhr.addEventListener("error", () => reject(new Error("Upload network error")));
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
        setUploadProgress((prev) => ({ ...prev, [i]: 100 }));
      }
      await Promise.all(
        videoIds.map(async (videoId, i) => {
          await fetch(`/api/videos/${videoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: uploadTitles[i]?.trim() || uploadFiles[i]?.name }),
          });
        }),
      );
      setUploadPhase("done");
    } catch {
      setUploadPhase("idle");
    }
  }

  function handleUploadDone() {
    resetUpload();
    setView("library");
    setOffset(0);
    setVideos([]);
    setRefreshKey((k) => k + 1);
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth={740}>
      {/* Custom header with tab toggle */}
      <div className={styles.pickerHeader}>
        <div className={styles.pickerHeaderTitle}>
          {view === "library" ? "Select Video" : "Upload Videos"}
        </div>
        <div className={styles.headerTabs}>
          <button
            type="button"
            className={`${styles.tabBtn}${view === "library" ? ` ${styles.tabBtnActive}` : ""}`}
            onClick={() => setView("library")}
            disabled={uploadPhase === "uploading"}
          >
            Library
          </button>
          <button
            type="button"
            className={`${styles.tabBtn}${view === "upload" ? ` ${styles.tabBtnActive}` : ""}`}
            onClick={() => { resetUpload(); setView("upload"); }}
            disabled={uploadPhase === "uploading"}
          >
            <LuUpload size={11} />
            Upload new
          </button>
        </div>
        <button
          type="button"
          className={styles.pickerCloseBtn}
          onClick={onClose}
          disabled={uploadPhase === "uploading"}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* ── Library view ─────────────────────────────────────────────── */}
      {view === "library" && (
        <>
          <div className={styles.searchBar}>
            <LuSearch size={14} color="rgba(255,255,255,0.35)" />
            <input
              className={styles.searchInput}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by title or tag…"
              autoFocus
            />
          </div>

          <div className={styles.body}>
            {loading && videos.length === 0 && (
              <div className={styles.spinner}>Loading…</div>
            )}

            {!loading && videos.length === 0 && (
              <div className={styles.empty}>
                {committedQuery
                  ? `No videos matching "${committedQuery}"`
                  : "No videos yet. Switch to Upload to add some."}
              </div>
            )}

            {videos.length > 0 && (
              <div className={styles.grid}>
                {videos.map((v) => {
                  const linked = alreadyLinkedIds.includes(v.id);
                  const dur = fmtDuration(v.durationSeconds);
                  return (
                    <div
                      key={v.id}
                      className={`${styles.card}${linked ? ` ${styles.cardAlreadyLinked}` : ""}`}
                      onClick={() => {
                        if (!linked) onSelect({ id: v.id, title: v.title, url: v.fileUrl });
                      }}
                    >
                      <div className={styles.thumb}>
                        <PickerThumb src={v.fileUrl} />
                        {linked && <div className={styles.linkedBadge}>Linked</div>}
                        <div className={styles.playOverlay}>
                          <div className={styles.playCircle}>
                            <FaPlay size={9} color="#34FDFE" />
                          </div>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <div className={styles.cardTitle}>{v.title}</div>
                        {dur && <div className={styles.cardDuration}>{dur}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <button
                type="button"
                className={styles.loadMore}
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Upload view ───────────────────────────────────────────────── */}
      {view === "upload" && (
        <div className={styles.uploadView}>
          {/* Uploading */}
          {uploadPhase === "uploading" && (
            <div className={styles.uploadBody}>
              <div className={styles.uploadingList}>
                {uploadFiles.map((f, i) => {
                  const pct = uploadProgress[i] ?? 0;
                  return (
                    <div key={f.name + i} className={styles.uploadingRow}>
                      <div className={styles.fileIconSmall}>
                        <LuFilm size={14} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className={styles.uploadingTitle}>{uploadTitles[i] || f.name}</div>
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

          {/* Done */}
          {uploadPhase === "done" && (
            <div className={styles.uploadBody}>
              <div className={styles.successBox}>
                <div className={styles.successIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <div className={styles.successTitle}>
                  {uploadFiles.length} Video{uploadFiles.length !== 1 ? "s" : ""} Uploaded
                </div>
                <div className={styles.successSub}>Go back to the library to select them.</div>
                <button type="button" className={styles.backToLibBtn} onClick={handleUploadDone}>
                  Back to Library
                </button>
              </div>
            </div>
          )}

          {/* Idle form */}
          {uploadPhase === "idle" && (
            <>
              <div className={styles.uploadBody}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleBrowse}
                  style={{ display: "none" }}
                />

                <div
                  className={`${styles.dropZone}${dragging ? ` ${styles.dropZoneDragging}` : ""}${uploadFiles.length > 0 ? ` ${styles.dropZoneCompact}` : ""}`}
                  onDragEnter={() => setDragging(true)}
                  onDragLeave={() => setDragging(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <LuUpload
                    size={uploadFiles.length > 0 ? 22 : 30}
                    color={dragging ? "var(--neon-cyan)" : "rgba(52,253,254,0.5)"}
                    style={{ margin: "0 auto 8px" }}
                  />
                  <div className={`${styles.dropLabel}${dragging ? ` ${styles.dropLabelActive}` : ""}`}>
                    {dragging
                      ? "Drop to add"
                      : uploadFiles.length > 0
                        ? "Drop more videos"
                        : "Drag & drop videos here"}
                  </div>
                  {uploadFiles.length === 0 && (
                    <div className={styles.dropSub}>
                      or <span className={styles.dropBrowseLink}>browse files</span> · MP4, MOV, AVI
                    </div>
                  )}
                </div>

                {uploadFiles.length > 0 && (
                  <div className={styles.uploadFileList}>
                    {uploadFiles.map((f, i) => (
                      <div
                        key={f.name + i}
                        className={`${styles.uploadFileRow}${titleErrors[i] ? ` ${styles.uploadFileRowError}` : ""}`}
                      >
                        <div className={styles.fileIconSmall}>
                          <LuFilm size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.uploadFileName}>{f.name}</div>
                          <input
                            className={`${styles.titleInput}${titleErrors[i] ? ` ${styles.titleInputError}` : ""}`}
                            value={uploadTitles[i] ?? ""}
                            placeholder="Video title…"
                            onChange={(e) => {
                              const next = [...uploadTitles];
                              next[i] = e.target.value;
                              setUploadTitles(next);
                              if (titleErrors[i]) {
                                const errs = [...titleErrors];
                                errs[i] = false;
                                setTitleErrors(errs);
                              }
                            }}
                          />
                          {titleErrors[i] && <div className={styles.titleError}>Title required</div>}
                        </div>
                        <button
                          type="button"
                          className={styles.removeUploadBtn}
                          onClick={() => removeUploadFile(i)}
                          aria-label="Remove"
                        >
                          <LuX size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.uploadFooter}>
                <div className={styles.uploadFooterCount}>
                  {uploadFiles.length
                    ? `${uploadFiles.length} file${uploadFiles.length > 1 ? "s" : ""} queued`
                    : "No files selected"}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    className={styles.cancelUploadBtn}
                    onClick={() => { resetUpload(); setView("library"); }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.startUploadBtn}
                    disabled={uploadFiles.length === 0}
                    onClick={startUpload}
                  >
                    <LuUpload size={12} />
                    Upload {uploadFiles.length > 0
                      ? `${uploadFiles.length} Video${uploadFiles.length > 1 ? "s" : ""}`
                      : "Videos"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}

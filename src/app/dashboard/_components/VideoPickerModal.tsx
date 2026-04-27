"use client";

import { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { LuSearch } from "react-icons/lu";
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
  const [query, setQuery] = useState("");
  const [committedQuery, setCommittedQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const [videos, setVideos] = useState<ApiVideo[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Fetch whenever committed query or offset changes.
  useEffect(() => {
    if (!isOpen) return;
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
        // hasMore: if we got a full page there are likely more results
        setHasMore(fetched.length === PAGE_SIZE);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen, committedQuery, offset]);

  // Reset state when the modal closes.
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setCommittedQuery("");
      setOffset(0);
      setVideos([]);
      setHasMore(false);
    }
  }, [isOpen]);

  function loadMore() {
    setOffset((prev) => prev + PAGE_SIZE);
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Select Video" maxWidth={740}>
      {/* Search bar */}
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
            {committedQuery ? `No videos matching "${committedQuery}"` : "No videos available."}
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
                    if (!linked) {
                      onSelect({ id: v.id, title: v.title, url: v.fileUrl });
                    }
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
    </Dialog>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { LuTrash2, LuUpload } from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { PageHeader } from "@/app/components/PageHeader";
import { deleteVideo } from "@/app/dashboard/videos/actions";
import type { VideoRow as VideoRowType } from "@/db/queries/videos";
import { UploadModal } from "./UploadModal";
import { VideoDetailModal } from "./VideoDetailModal";
import styles from "./VideoGallery.module.css";

type Tag = VideoRowType["videoTags"][number]["tag"];

const TAG_COLORS = ["#FD6DBB", "#34FDFE", "#a78bfa", "#4ade80", "#fb923c"];
const COLOR_MAP: Record<string, string> = {
  A: "#FD6DBB",
  B: "#34FDFE",
  C: "#a78bfa",
  D: "#4ade80",
  E: "#fb923c",
  F: "#FD6DBB",
  G: "#34FDFE",
  H: "#a78bfa",
  I: "#4ade80",
  J: "#FD6DBB",
  K: "#34FDFE",
  L: "#a78bfa",
  M: "#4ade80",
  N: "#fb923c",
  O: "#FD6DBB",
  P: "#34FDFE",
  Q: "#a78bfa",
  R: "#4ade80",
  S: "#FD6DBB",
  T: "#34FDFE",
  U: "#a78bfa",
  V: "#4ade80",
  W: "#fb923c",
  X: "#FD6DBB",
  Y: "#34FDFE",
  Z: "#a78bfa",
};

function tagColor(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return TAG_COLORS[sum % TAG_COLORS.length];
}

function uploaderColor(name: string): string {
  return COLOR_MAP[name[0]?.toUpperCase()] ?? "#FD6DBB";
}

function formatDuration(seconds: number | null): string | null {
  if (seconds === null) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

function VideoThumbnail({ src }: { src: string }) {
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
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
    />
  );
}

function VideoCard({ v, onSelect }: { v: VideoRowType; onSelect: () => void }) {
  const isDeleted = v.deletedAt !== null;
  const primaryTag = v.videoTags[0]?.tag ?? null;
  const color = primaryTag ? tagColor(primaryTag.name) : "#34FDFE";
  const uploaderCol = uploaderColor(v.uploader.name);
  const duration = formatDuration(v.durationSeconds);

  return (
    <button
      type="button"
      className={styles.videoCard}
      onClick={onSelect}
      style={
        isDeleted ? { opacity: 0.45, filter: "grayscale(0.6)" } : undefined
      }
    >
      <div className={styles.videoThumb}>
        <VideoThumbnail src={v.fileUrl} />
        <div className={styles.videoThumbPattern} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${color}0a, transparent 60%)`,
          }}
        />
        <div className={styles.videoPlay}>
          <FaPlay size={14} color="#34FDFE" />
        </div>
        {duration && <div className={styles.videoDuration}>{duration}</div>}
        {primaryTag && (
          <div
            className={styles.videoTagPill}
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}44`,
            }}
          >
            {primaryTag.name}
          </div>
        )}
      </div>

      <div className={styles.videoBody}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div className={styles.videoTitle} style={{ flex: 1 }}>
            {v.title}
          </div>
          {primaryTag && (
            <span
              style={{
                background: `${color}22`,
                color,
                border: `1px solid ${color}44`,
                borderRadius: 20,
                padding: "2px 9px",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {primaryTag.name}
            </span>
          )}
        </div>

        {v.description && <p className={styles.videoDesc}>{v.description}</p>}

        <div className={styles.videoMeta}>
          <div className={styles.videoUploader}>
            <div
              className={styles.miniAvatar}
              style={{
                background: `${uploaderCol}22`,
                borderColor: `${uploaderCol}55`,
                color: uploaderCol,
              }}
            >
              {v.uploader.name[0]?.toUpperCase()}
            </div>
            {v.uploader.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {isDeleted && <LuTrash2 size={12} color="rgba(248,113,113,0.7)" />}
            <div className={styles.videoDate}>{formatDate(v.createdAt)}</div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function VideoGallery({
  videos,
  title = "Latest Videos",
  subtitle = "Recently uploaded by your team",
  ...rest
}: {
  videos: VideoRowType[];
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [activeTag, setActiveTag] = useState<string>("All");
  const [selectedVideo, setSelectedVideo] = useState<VideoRowType | null>(null);

  // Collect unique tags across all videos
  const allTags: Tag[] = [];
  const seen = new Set<string>();
  for (const v of videos) {
    for (const vt of v.videoTags) {
      if (!seen.has(vt.tag.id)) {
        seen.add(vt.tag.id);
        allTags.push(vt.tag);
      }
    }
  }
  allTags.sort((a, b) => a.name.localeCompare(b.name));

  const shown =
    activeTag === "All"
      ? videos
      : videos.filter((v) =>
          v.videoTags.some((vt) => vt.tag.name === activeTag),
        );

  return (
    <>
      <div {...rest}>
        <PageHeader
          title={title}
          subtitle={subtitle}
          action={
            <Button
              variant="outline"
              colorScheme="cyan"
              size="sm"
              onClick={() => setIsUploadOpen(true)}
            >
              <LuUpload size={13} />
              Upload Video
            </Button>
          }
        />

        {allTags.length > 0 && (
          <div className={styles.tagFilters}>
            <button
              type="button"
              className={`${styles.tagPill}${activeTag === "All" ? ` ${styles.active}` : ""}`}
              onClick={() => setActiveTag("All")}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={`${styles.tagPill}${activeTag === tag.name ? ` ${styles.active}` : ""}`}
                onClick={() => setActiveTag(tag.name)}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="crm-table-empty">No videos yet.</div>
        ) : (
          <div className={styles.videoGrid}>
            {shown.map((v) => (
              <VideoCard
                key={v.id}
                v={v}
                onSelect={() => setSelectedVideo(v)}
              />
            ))}
          </div>
        )}

        {selectedVideo && (
          <VideoDetailModal
            videoId={selectedVideo.id}
            fileUrl={selectedVideo.fileUrl}
            initialTitle={selectedVideo.title}
            onClose={() => setSelectedVideo(null)}
            onDelete={async () => {
              await deleteVideo(selectedVideo.id);
              router.refresh();
            }}
          />
        )}
      </div>
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          router.refresh();
        }}
      />

    </>
  );
}

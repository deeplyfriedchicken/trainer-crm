"use client";

import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import {
  LuCalendar,
  LuClock,
  LuFileVideo,
  LuHardDrive,
  LuUpload,
  LuUser,
} from "react-icons/lu";
import { Button } from "@/app/components/Button";
import { Dialog, DialogBody } from "@/app/components/Dialog";
import { PageHeader } from "@/app/components/PageHeader";
import type { VideoRow as VideoRowType } from "@/db/queries/videos";
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

function VideoThumbnail({
  src,
  onAspectRatio,
}: {
  src: string;
  onAspectRatio?: (ratio: string) => void;
}) {
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
        if (v) {
          v.currentTime = Math.min(1, v.duration * 0.1);
          if (v.videoWidth && v.videoHeight) {
            onAspectRatio?.(`${v.videoWidth} / ${v.videoHeight}`);
          }
        }
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  );
}

function VideoCard({ v, onSelect }: { v: VideoRowType; onSelect: () => void }) {
  const [aspectRatio, setAspectRatio] = useState("16 / 9");
  const primaryTag = v.videoTags[0]?.tag ?? null;
  const color = primaryTag ? tagColor(primaryTag.name) : "#34FDFE";
  const uploaderCol = uploaderColor(v.uploader.name);
  const duration = formatDuration(v.durationSeconds);

  return (
    <button type="button" className={styles.videoCard} onClick={onSelect}>
      <div className={styles.videoThumb} style={{ aspectRatio }}>
        <VideoThumbnail src={v.fileUrl} onAspectRatio={setAspectRatio} />
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
          <div className={styles.videoDate}>{formatDate(v.createdAt)}</div>
        </div>
      </div>
    </button>
  );
}

export function VideoGallery({
  videos,
  title = "Latest Videos",
  subtitle = "Recently uploaded by your team",
  onUpload,
  ...rest
}: {
  videos: VideoRowType[];
  title?: string;
  subtitle?: string;
  onUpload?: () => void;
}) {
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
    <div {...rest}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          onUpload && (
            <Button
              variant="outline"
              colorScheme="cyan"
              size="sm"
              onClick={onUpload}
            >
              <LuUpload size={13} />
              Upload Video
            </Button>
          )
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
            <VideoCard key={v.id} v={v} onSelect={() => setSelectedVideo(v)} />
          ))}
        </div>
      )}

      {selectedVideo &&
        (() => {
          const v = selectedVideo;
          const uploaderCol = uploaderColor(v.uploader.name);
          const duration = formatDuration(v.durationSeconds);
          return (
            <Dialog
              isOpen
              onClose={() => setSelectedVideo(null)}
              maxWidth={900}
            >
              <video
                key={v.id}
                src={v.fileUrl}
                controls
                autoPlay
                style={{
                  width: "100%",
                  display: "block",
                  maxHeight: "52vh",
                  background: "#000",
                }}
              >
                <track
                  kind="captions"
                  srcLang="en"
                  label="English"
                  src="data:text/vtt;charset=utf-8,WEBVTT"
                  default
                />
              </video>
              <DialogBody>
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {v.title}
                  </div>
                  {v.videoTags.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {v.videoTags.map(({ tag }: { tag: Tag }) => {
                        const c = tagColor(tag.name);
                        return (
                          <span
                            key={tag.id}
                            style={{
                              background: `${c}22`,
                              color: c,
                              border: `1px solid ${c}44`,
                              borderRadius: 20,
                              padding: "2px 10px",
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {tag.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {v.description && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.6,
                      marginBottom: 18,
                    }}
                  >
                    {v.description}
                  </p>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 24px",
                  }}
                >
                  <MetaRow icon={<LuUser size={13} />} label="Uploaded by">
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 7 }}
                    >
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
                  </MetaRow>
                  <MetaRow icon={<LuCalendar size={13} />} label="Uploaded">
                    {formatDate(v.createdAt)}
                  </MetaRow>
                  {duration && (
                    <MetaRow icon={<LuClock size={13} />} label="Duration">
                      {duration}
                    </MetaRow>
                  )}
                  <MetaRow icon={<LuHardDrive size={13} />} label="File size">
                    {formatFileSize(v.fileSizeBytes)}
                  </MetaRow>
                  <MetaRow icon={<LuFileVideo size={13} />} label="File">
                    {v.fileName}
                  </MetaRow>
                </div>
              </DialogBody>
            </Dialog>
          );
        })()}
    </div>
  );
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {icon}
        {label}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
        {children}
      </div>
    </>
  );
}

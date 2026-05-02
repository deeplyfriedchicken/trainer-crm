"use client";

import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { Dialog } from "@/app/components/Dialog";

export type TraineeVideoEntry = {
  id: string;
  title: string;
  url: string;
  durationSeconds?: number | null;
};

function formatDuration(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function VideoThumb({ src }: { src: string }) {
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
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}

function VideoCard({
  video,
  accentColor,
  onSelect,
}: {
  video: TraineeVideoEntry;
  accentColor: string;
  onSelect: () => void;
}) {
  const duration = video.durationSeconds != null ? formatDuration(video.durationSeconds) : null;
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        appearance: "none",
        background: "var(--neon-surface-2)",
        border: "1px solid var(--neon-border)",
        borderRadius: 12,
        overflow: "hidden",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        color: "inherit",
        font: "inherit",
        transition: "border-color 0.2s, transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = `${accentColor}55`;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `0 10px 32px rgba(0,0,0,0.4), 0 0 20px ${accentColor}12`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.borderColor = "var(--neon-border)";
        el.style.transform = "";
        el.style.boxShadow = "";
      }}
    >
      <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", position: "relative", overflow: "hidden" }}>
        <VideoThumb src={video.url} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${accentColor}0a, transparent 60%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(52,253,254,0.15)",
            border: "2px solid rgba(52,253,254,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <FaPlay size={13} color="#34FDFE" />
        </div>
        {duration && (
          <div
            style={{
              position: "absolute",
              bottom: 7,
              right: 7,
              background: "rgba(0,0,0,0.75)",
              borderRadius: 5,
              padding: "2px 7px",
              fontSize: 11,
              fontFamily: "var(--font-neon-mono)",
              color: "#fff",
              zIndex: 1,
            }}
          >
            {duration}
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {video.title}
        </div>
      </div>
    </button>
  );
}

export function TraineeVideosPanel({
  videos,
  accentColor,
}: {
  videos: TraineeVideoEntry[];
  accentColor: string;
}) {
  const [selected, setSelected] = useState<TraineeVideoEntry | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <div
        style={{
          background: "var(--neon-surface)",
          border: "1px solid var(--neon-border)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--neon-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Videos</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </div>
        </div>

        <div
          style={{
            padding: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              accentColor={accentColor}
              onSelect={() => setSelected(v)}
            />
          ))}
        </div>
      </div>

      {selected && (
        <Dialog isOpen onClose={() => setSelected(null)} title={selected.title} maxWidth={900}>
          <video
            key={selected.id}
            src={selected.url}
            controls
            autoPlay
            style={{ width: "100%", display: "block", maxHeight: "60vh", background: "#000" }}
          >
            <track kind="captions" srcLang="en" label="English" src="data:text/vtt;charset=utf-8,WEBVTT" default />
          </video>
        </Dialog>
      )}
    </>
  );
}

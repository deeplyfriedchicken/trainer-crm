"use client";

import { useState } from "react";
import { FaPlay } from "react-icons/fa6";
import type { VideoRow } from "@/db/queries/videos";

type Tag = VideoRow["videoTags"][number]["tag"];

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
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function VideoGallery({ videos }: { videos: VideoRow[] }) {
  const [activeTag, setActiveTag] = useState<string>("All");

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
      : videos.filter((v) => v.videoTags.some((vt) => vt.tag.name === activeTag));

  return (
    <>
      <div className="crm-page-header" style={{ marginBottom: 16, marginTop: 40 }}>
        <div>
          <div className="crm-page-title">Latest Videos</div>
          <div className="crm-page-sub">Recently uploaded by your team</div>
        </div>
      </div>

      {allTags.length > 0 && (
        <div className="crm-tag-filters">
          <button
            type="button"
            className={`crm-tag-pill${activeTag === "All" ? " active" : ""}`}
            onClick={() => setActiveTag("All")}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className={`crm-tag-pill${activeTag === tag.name ? " active" : ""}`}
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
        <div className="crm-video-grid">
          {shown.map((v) => {
            const primaryTag = v.videoTags[0]?.tag ?? null;
            const color = primaryTag ? tagColor(primaryTag.name) : "#34FDFE";
            const uploaderCol = uploaderColor(v.uploader.name);
            const duration = formatDuration(v.durationSeconds);

            return (
              <div key={v.id} className="crm-video-card">
                <div className="crm-video-thumb">
                  <div className="crm-video-thumb-pattern" />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, ${color}0a, transparent 60%)`,
                    }}
                  />
                  <div className="crm-video-play">
                    <FaPlay size={14} color="#34FDFE" />
                  </div>
                  {duration && (
                    <div className="crm-video-duration">{duration}</div>
                  )}
                  {primaryTag && (
                    <div
                      className="crm-video-tag-pill"
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

                <div className="crm-video-body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div className="crm-video-title" style={{ flex: 1 }}>
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

                  {v.description && (
                    <p className="crm-video-desc">{v.description}</p>
                  )}

                  <div className="crm-video-meta">
                    <div className="crm-video-uploader">
                      <div
                        className="crm-mini-avatar"
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
                    <div className="crm-video-date">{formatDate(v.createdAt)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

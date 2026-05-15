"use client";

import { useRef, useState } from "react";

interface Video {
  id: string;
  title: string;
  fileUrl: string;
}

export function VideoCarousel({ videos }: { videos: Video[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIdx(Math.round(el.scrollLeft / el.offsetWidth));
  }

  function scrollTo(idx: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.offsetWidth, behavior: "smooth" });
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          overflowX: "scroll",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
          borderRadius: "var(--radius)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            style={{ flex: "0 0 100%", scrollSnapAlign: "start" }}
          >
            {videos.length > 1 && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--color-text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {video.title}
              </div>
            )}
            <div
              style={{
                borderRadius: "var(--radius)",
                overflow: "hidden",
                background: "#000",
                boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                width: "100%",
              }}
            >
              <video
                src={video.fileUrl}
                controls
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "auto", maxHeight: "70vh", display: "block" }}
              />
            </div>
          </div>
        ))}
      </div>

      {videos.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            marginTop: 10,
          }}
        >
          {videos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Video ${i + 1}`}
              onClick={() => scrollTo(i)}
              style={{
                width: activeIdx === i ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background:
                  activeIdx === i
                    ? "var(--color-primary)"
                    : "var(--color-border-strong)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.2s, background 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

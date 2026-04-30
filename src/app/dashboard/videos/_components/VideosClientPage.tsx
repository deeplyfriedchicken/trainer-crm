"use client";

import { VideoGallery } from "@/app/dashboard/_components/VideoGallery";
import type { VideoRow } from "@/db/queries/videos";

export function VideosClientPage({
  initialVideos,
}: {
  initialVideos: VideoRow[];
}) {
  return (
    <VideoGallery
      videos={initialVideos}
      title="Videos"
      subtitle="All videos uploaded by your team"
    />
  );
}

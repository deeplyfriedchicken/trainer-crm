"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { VideoGallery } from "@/app/dashboard/_components/VideoGallery";
import { UploadModal } from "@/app/dashboard/_components/UploadModal";
import type { VideoRow } from "@/db/queries/videos";

export function VideosClientPage({ initialVideos }: { initialVideos: VideoRow[] }) {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <VideoGallery
        videos={initialVideos}
        title="Videos"
        subtitle="All videos uploaded by your team"
        onUpload={() => setIsUploadOpen(true)}
      />
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

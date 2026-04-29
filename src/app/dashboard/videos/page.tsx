import { listVideos } from "@/db/queries/videos";
import { getPresignedGetUrl } from "@/lib/s3";
import { VideosClientPage } from "./_components/VideosClientPage";

export default async function VideosPage() {
  const raw = await listVideos({ limit: 100, offset: 0, status: "ready" });
  const videos = await Promise.all(
    raw.map(async (v) => ({ ...v, fileUrl: await getPresignedGetUrl(v.fileKey, 3600) })),
  );

  return (
    <div className="crm-page">
      <VideosClientPage initialVideos={videos} />
    </div>
  );
}

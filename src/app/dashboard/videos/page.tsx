import { listVideos } from "@/db/queries/videos";
import { VideosClientPage } from "./_components/VideosClientPage";

export default async function VideosPage() {
  const videos = await listVideos({ limit: 100, offset: 0, status: "ready" });

  return (
    <div className="crm-page">
      <VideosClientPage initialVideos={videos} />
    </div>
  );
}

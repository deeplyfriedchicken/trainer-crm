import { listVideos } from "@/db/queries/videos";
import { getCurrentUser } from "@/lib/auth";
import { getPresignedGetUrl } from "@/lib/s3";
import { VideosClientPage } from "./_components/VideosClientPage";

export default async function VideosPage() {
  const user = await getCurrentUser();
  const isAdmin = user.roles.includes("admin");

  const raw = await listVideos({
    limit: 100,
    offset: 0,
    status: "ready",
    includeDeleted: isAdmin,
  });
  const videos = await Promise.all(
    raw.map(async (v) => ({ ...v, fileUrl: await getPresignedGetUrl(v.fileKey, 3600) })),
  );

  return (
    <div className="crm-page">
      <VideosClientPage initialVideos={videos} />
    </div>
  );
}

import type { NextRequest } from "next/server";
import { getVideoById, updateVideo } from "@/db/queries/videos";
import { getApiUser } from "@/lib/api-auth";
import {
  getProcessedKey,
  getProcessedUrl,
  submitTranscodeJob,
} from "@/lib/mediaconvert";

// @invokes updateVideo(id, ...), submitTranscodeJob(id, fileKey)
// @errors 401 unauthorized | 403 forbidden | 404 not found | 409 not in processable state
// @returns 200 (SKIP_TRANSCODING) | 202 transcoding submitted
export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]/process">,
) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const isOwner = video.uploader.id === user.id;
  const isPrivileged =
    user.roles.includes("admin") || user.roles.includes("trainer_manager");
  if (!isOwner && !isPrivileged) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (video.status !== "uploading" && video.status !== "failed") {
    return Response.json(
      { error: "Video is not in a processable state" },
      { status: 409 },
    );
  }

  // Local dev: skip transcoding and mark ready immediately
  if (process.env.SKIP_TRANSCODING === "true") {
    const updated = await updateVideo(id, { status: "ready" });
    return Response.json({ data: updated });
  }

  // Production: pre-set the processed key/url so the unique index won't conflict on completion
  const updated = await updateVideo(id, {
    status: "processing",
    originalFileKey: video.fileKey,
    fileKey: getProcessedKey(id),
    fileUrl: getProcessedUrl(id),
  });

  await submitTranscodeJob(id, video.fileKey);

  return Response.json({ data: updated }, { status: 202 });
}

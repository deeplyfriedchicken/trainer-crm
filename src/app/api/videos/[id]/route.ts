import type { NextRequest } from "next/server";
import { setVideoTags } from "@/db/queries/tags";
import { getVideoById, softDeleteVideo, updateVideo } from "@/db/queries/videos";
import { getApiUser } from "@/lib/api-auth";
import { getRequestUser } from "@/lib/request-auth";
import {
  getProcessedKey,
  getProcessedUrl,
  submitTranscodeJob,
} from "@/lib/mediaconvert";
import { getPresignedGetUrl } from "@/lib/s3";

// @invokes getVideoById(id), getPresignedGetUrl(video.fileKey, 3600)
// @errors 401 unauthorized | 404 video not found
export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }
  return Response.json({
    data: { ...video, fileUrl: await getPresignedGetUrl(video.fileKey, 3600) },
  });
}

// @body { title?: string; description?: string; traineeId?: string | null; tagIds?: string[] }
// @invokes updateVideo(id, input), setVideoTags(id, tagIds), submitTranscodeJob(id, fileKey)
// @errors 401 unauthorized | 404 video not found | 409 video not in uploading state | 202 transcoding submitted (production) | 200 ready immediately (SKIP_TRANSCODING)
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]">,
) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.status !== "uploading") {
    return Response.json(
      { error: "Video is not in uploading state" },
      { status: 409 },
    );
  }

  const body = await request.json();
  const { title, description, traineeId, tagIds } = body as {
    title?: string;
    description?: string;
    traineeId?: string | null;
    tagIds?: string[];
  };

  if (tagIds !== undefined) {
    await setVideoTags(id, tagIds);
  }

  // Local dev: skip transcoding and mark ready immediately
  if (process.env.SKIP_TRANSCODING === "true") {
    const updated = await updateVideo(id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(traineeId !== undefined && { traineeId }),
      status: "ready",
    });
    return Response.json({ data: updated });
  }

  // Production: submit transcoding job and transition to processing
  const updated = await updateVideo(id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(traineeId !== undefined && { traineeId }),
    status: "processing",
    originalFileKey: video.fileKey,
    // Pre-set the processed key/url so the unique index won't conflict on completion
    fileKey: getProcessedKey(id),
    fileUrl: getProcessedUrl(id),
  });

  await submitTranscodeJob(id, video.fileKey);

  return Response.json({ data: updated }, { status: 202 });
}

// @invokes softDeleteVideo(id)
// @errors 401 unauthorized | 404 video not found | 204 no content
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]">,
) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;

  const video = await softDeleteVideo(id);
  if (!video) return Response.json({ error: "Video not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}

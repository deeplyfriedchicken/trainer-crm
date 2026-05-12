import type { NextRequest } from "next/server";
import { setVideoTags } from "@/db/queries/tags";
import {
  getVideoById,
  softDeleteVideo,
  updateVideo,
} from "@/db/queries/videos";
import { getApiUser } from "@/lib/api-auth";
import { getRequestUser } from "@/lib/request-auth";
import { getPresignedGetUrl } from "@/lib/s3";

// @invokes getVideoById(id), getPresignedGetUrl(video.fileKey, 3600)
// @errors 401 unauthorized | 404 video not found
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }
  return Response.json({
    data: { ...video, fileUrl: await getPresignedGetUrl(video.fileKey, 3600) },
  });
}

// @body { title?: string; description?: string | null; traineeId?: string | null; tagIds?: string[] }
// @invokes updateVideo(id, input), setVideoTags(id, tagIds)
// @errors 400 validation | 401 unauthorized | 403 forbidden | 404 not found
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

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

  const body = await request.json();
  const { title, description, traineeId, tagIds } = body as {
    title?: string;
    description?: string | null;
    traineeId?: string | null;
    tagIds?: string[];
  };

  if (title !== undefined && title.trim() === "") {
    return Response.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  if (tagIds !== undefined) {
    await setVideoTags(id, tagIds);
  }

  const updated = await updateVideo(id, {
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description }),
    ...(traineeId !== undefined && { traineeId }),
  });

  return Response.json({ data: updated });
}

// @invokes softDeleteVideo(id)
// @errors 401 unauthorized | 404 video not found | 204 no content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const video = await softDeleteVideo(id);
  if (!video)
    return Response.json({ error: "Video not found" }, { status: 404 });
  return new Response(null, { status: 204 });
}

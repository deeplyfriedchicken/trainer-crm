import type { NextRequest } from "next/server";
import { setVideoTags } from "@/db/queries/tags";
import { getVideoById, updateVideo } from "@/db/queries/videos";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]">,
) {
  await getCurrentUser();
  const { id } = await ctx.params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }
  return Response.json({ data: video });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/videos/[id]">,
) {
  await getCurrentUser();
  const { id } = await ctx.params;

  const video = await getVideoById(id);
  if (!video) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, tagIds } = body as {
    title?: string;
    description?: string;
    tagIds?: string[];
  };

  const updated = await updateVideo(id, {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    status: "ready",
  });

  if (tagIds !== undefined) {
    await setVideoTags(id, tagIds);
  }

  return Response.json({ data: updated });
}

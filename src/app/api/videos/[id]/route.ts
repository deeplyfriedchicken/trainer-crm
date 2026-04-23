import type { NextRequest } from "next/server";
import { getVideoById } from "@/db/queries/videos";
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

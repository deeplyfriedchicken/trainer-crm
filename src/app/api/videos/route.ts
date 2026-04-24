import type { NextRequest } from "next/server";
import { listVideos } from "@/db/queries/videos";
import { type VideoStatus, videoStatus } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  // TODO(auth): apply role-based filtering once auth lands.
  await getCurrentUser();

  const params = request.nextUrl.searchParams;
  const { limit, offset } = parsePagination(params);
  const uploaderId = params.get("uploaderId") ?? undefined;

  const statusParam = params.get("status");
  let status: VideoStatus | undefined;
  if (statusParam !== null) {
    if (!(videoStatus.enumValues as readonly string[]).includes(statusParam)) {
      return Response.json(
        {
          error: `Invalid status. Expected one of: ${videoStatus.enumValues.join(", ")}`,
        },
        { status: 400 },
      );
    }
    status = statusParam as VideoStatus;
  }

  const data = await listVideos({ limit, offset, uploaderId, status });

  return Response.json({
    data,
    pagination: { limit, offset },
  });
}

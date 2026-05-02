import type { NextRequest } from "next/server";
import { listVideos } from "@/db/queries/videos";
import { type VideoStatus, videoStatus } from "@/db/schema";
import { getApiUser } from "@/lib/api-auth";
import { parsePagination } from "@/lib/pagination";
import { getPresignedGetUrl } from "@/lib/s3";

export async function GET(request: NextRequest) {
  // TODO(auth): apply role-based filtering once auth lands.
  const user = await getApiUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

  const search = params.get("q") ?? undefined;
  const videos = await listVideos({ limit, offset, uploaderId, status, search });
  const data = await Promise.all(
    videos.map(async (v) => ({
      ...v,
      fileUrl: await getPresignedGetUrl(v.fileKey, 3600),
    })),
  );

  return Response.json({
    data,
    pagination: { limit, offset },
  });
}

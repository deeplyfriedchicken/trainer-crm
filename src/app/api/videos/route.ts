import type { NextRequest } from "next/server";
import { listVideos } from "@/db/queries/videos";
import { type VideoStatus, videoStatus } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

// TODO clampInit is used across multiple endpoints, push this into a service
function clampInt(raw: string | null, fallback: number, max?: number) {
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return max !== undefined ? Math.min(parsed, max) : parsed;
}

export async function GET(request: NextRequest) {
  // TODO(auth): apply role-based filtering once auth lands.
  await getCurrentUser();

  const params = request.nextUrl.searchParams;
  const limit = clampInt(params.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);
  const offset = clampInt(params.get("offset"), 0);
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

import type { NextRequest } from "next/server";
import { listTrainers } from "@/db/queries/trainers";
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

  const data = await listTrainers({ limit, offset });

  return Response.json({
    data,
    pagination: { limit, offset },
  });
}

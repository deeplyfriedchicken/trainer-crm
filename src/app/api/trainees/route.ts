import type { NextRequest } from "next/server";
import { listTrainees } from "@/db/queries/trainees";
import { getCurrentUser } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  // TODO(auth): apply role-based filtering once auth lands.
  await getCurrentUser();

  const params = request.nextUrl.searchParams;
  const { limit, offset } = parsePagination(params);
  const trainerId = params.get("trainerId") ?? undefined;

  const data = await listTrainees({ limit, offset, trainerId });

  return Response.json({
    data,
    pagination: { limit, offset },
  });
}

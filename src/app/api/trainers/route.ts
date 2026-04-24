import type { NextRequest } from "next/server";
import { listTrainers } from "@/db/queries/trainers";
import { getCurrentUser } from "@/lib/auth";
import { parsePagination } from "@/lib/pagination";

export async function GET(request: NextRequest) {
  // TODO(auth): apply role-based filtering once auth lands.
  await getCurrentUser();

  const params = request.nextUrl.searchParams;
  const { limit, offset } = parsePagination(params);

  const data = await listTrainers({ limit, offset });

  return Response.json({
    data,
    pagination: { limit, offset },
  });
}

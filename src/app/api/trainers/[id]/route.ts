import type { NextRequest } from "next/server";
import { getTrainerById } from "@/db/queries/trainers";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/trainers/[id]">,
) {
  await getCurrentUser();
  const { id } = await ctx.params;

  const trainer = await getTrainerById(id);
  if (!trainer) {
    return Response.json({ error: "Trainer not found" }, { status: 404 });
  }
  return Response.json({ data: trainer });
}

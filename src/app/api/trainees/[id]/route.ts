import type { NextRequest } from "next/server";
import { getTraineeById } from "@/db/queries/trainees";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/trainees/[id]">,
) {
  await getCurrentUser();
  const { id } = await ctx.params;

  const trainee = await getTraineeById(id);
  if (!trainee) {
    return Response.json({ error: "Trainee not found" }, { status: 404 });
  }
  return Response.json({ data: trainee });
}

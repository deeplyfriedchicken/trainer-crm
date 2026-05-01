import type { NextRequest } from "next/server";
import { getTraineeById, updateTrainee, deleteTrainee } from "@/db/queries/trainees";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/trainees/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const trainee = await getTraineeById(id);
  if (!trainee) return Response.json({ error: "Trainee not found" }, { status: 404 });
  return Response.json({ data: trainee });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/trainees/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = (await request.json()) as { name?: string; email?: string };
  const updated = await updateTrainee(id, body);
  if (!updated) return Response.json({ error: "Trainee not found" }, { status: 404 });
  return Response.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/trainees/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = new Set(["admin", "trainer_manager"] as const);
  if (!user.roles.some((r) => allowed.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await deleteTrainee(id);
  return new Response(null, { status: 204 });
}

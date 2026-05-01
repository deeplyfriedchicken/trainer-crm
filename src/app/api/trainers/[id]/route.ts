import type { NextRequest } from "next/server";
import { getTrainerById, updateTrainer, deleteTrainer } from "@/db/queries/trainers";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/trainers/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const trainer = await getTrainerById(id);
  if (!trainer) return Response.json({ error: "Trainer not found" }, { status: 404 });
  return Response.json({ data: trainer });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/trainers/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = (await request.json()) as { name?: string; email?: string; role?: string };

  const role =
    body.role === "trainer_manager"
      ? ("trainer_manager" as const)
      : body.role === "trainer"
        ? ("trainer" as const)
        : undefined;

  const updated = await updateTrainer(id, { name: body.name, email: body.email, role });
  if (!updated) return Response.json({ error: "Trainer not found" }, { status: 404 });
  return Response.json({ data: updated });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/trainers/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const allowed = new Set(["admin", "trainer_manager"] as const);
  if (!user.roles.some((r) => allowed.has(r as never))) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  await deleteTrainer(id);
  return new Response(null, { status: 204 });
}

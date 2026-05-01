import type { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises, workoutPlans } from "@/db/schema";
import { updateWorkoutPlan, type ExerciseInput } from "@/db/queries/workout-plans";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/workout-plans/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, id),
    with: {
      exercises: {
        orderBy: (ex, { asc }) => [asc(ex.createdAt)],
      },
    },
  });

  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
  return Response.json({ data: plan });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/workout-plans/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  const body = (await request.json()) as {
    name?: string;
    occurredAt?: string;
    comment?: string;
    exercises?: ExerciseInput[];
  };

  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const existing = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, id),
  });
  if (!existing) return Response.json({ error: "Plan not found" }, { status: 404 });

  const plan = await updateWorkoutPlan({
    planId: id,
    name: body.name.trim(),
    occurredAt: body.occurredAt ? new Date(body.occurredAt) : existing.occurredAt,
    comment: body.comment,
    updatedBy: user.id,
    exerciseInputs: body.exercises ?? [],
  });

  return Response.json({ data: plan });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/workout-plans/[id]">,
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  await db.transaction(async (tx) => {
    await tx.delete(exercises).where(eq(exercises.workoutPlanId, id));
    await tx.delete(workoutPlans).where(eq(workoutPlans.id, id));
  });

  return new Response(null, { status: 204 });
}

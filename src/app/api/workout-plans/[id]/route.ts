import { and, eq, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import {
  type ExerciseInput,
  forkDraftFromPublished,
  updateWorkoutPlan,
} from "@/db/queries/workout-plans";
import { workoutPlans } from "@/db/schema";
import { getRequestUser } from "@/lib/request-auth";

// @invokes db.query.workoutPlans.findFirst({ with: exercises })
// @errors 401 unauthorized | 404 plan not found
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, id),
    with: {
      exercises: {
        where: (ex, { isNull }) => isNull(ex.deletedAt),
        orderBy: (ex, { asc }) => [asc(ex.position)],
      },
    },
  });

  if (!plan) return Response.json({ error: "Plan not found" }, { status: 404 });
  return Response.json({ data: plan });
}

// @body { name: string; comment?: string; exercises?: ExerciseInput[] }
// @invokes updateWorkoutPlan({ planId, name, comment, updatedBy, exerciseInputs })
// @errors 400 name required | 401 unauthorized | 404 plan not found
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const body = (await request.json()) as {
    name?: string;
    comment?: string;
    exercises?: ExerciseInput[];
  };

  if (!body.name?.trim()) {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const existing = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, id),
  });
  if (!existing)
    return Response.json({ error: "Plan not found" }, { status: 404 });

  if (existing.versionStatus === "archived") {
    return Response.json(
      { error: "Cannot edit an archived plan." },
      { status: 400 },
    );
  }

  // Draft → update in place. Exercises are only touched when explicitly supplied.
  if (existing.versionStatus === "draft") {
    const plan = await updateWorkoutPlan({
      planId: id,
      name: body.name.trim(),
      comment: body.comment,
      updatedBy: user.id,
      traineeId: existing.traineeId,
      exerciseInputs: body.exercises, // undefined = leave exercises untouched
    });
    return Response.json({ data: plan });
  }

  // Published → find or create a draft in the same group, then apply the patch.
  const groupId = existing.workoutPlanGroupId;

  const existingDraft = groupId
    ? await db.query.workoutPlans.findFirst({
        where: and(
          eq(workoutPlans.workoutPlanGroupId, groupId),
          eq(workoutPlans.versionStatus, "draft"),
          isNull(workoutPlans.deletedAt),
        ),
      })
    : null;

  if (existingDraft) {
    const plan = await updateWorkoutPlan({
      planId: existingDraft.id,
      name: body.name.trim(),
      comment: body.comment,
      updatedBy: user.id,
      traineeId: existing.traineeId,
      exerciseInputs: body.exercises,
    });
    return Response.json({ data: plan });
  }

  // No draft yet — fork from the published plan.
  const draft = await forkDraftFromPublished({
    publishedPlanId: id,
    name: body.name.trim(),
    comment: body.comment !== undefined ? body.comment : existing.comment,
    exerciseInputs: body.exercises,
    createdBy: user.id,
  });

  return Response.json({ data: draft });
}

// @invokes db.update(workoutPlans).set({ deletedAt }) WHERE id — soft delete, preserves exercises and workout history
// @errors 401 unauthorized | 404 plan not found | 409 cannot delete published plan | 204 no content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, id),
    columns: { id: true, versionStatus: true },
  });
  if (!plan)
    return Response.json({ error: "Plan not found" }, { status: 404 });

  if (plan.versionStatus === "published") {
    return Response.json(
      { error: "Cannot delete a published plan." },
      { status: 409 },
    );
  }

  await db
    .update(workoutPlans)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(eq(workoutPlans.id, id));

  return new Response(null, { status: 204 });
}

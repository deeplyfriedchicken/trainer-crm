import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { exercises, workoutPlans } from "@/db/schema";
import { getRequestUser } from "@/lib/request-auth";

// @invokes db.update(exercises).set({ deletedAt }) WHERE id — soft delete
// @errors 401 unauthorized | 404 not found | 409 cannot delete from non-draft plan | 204 no content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, id),
    columns: { id: true, workoutPlanId: true, deletedAt: true },
  });

  if (!exercise || exercise.deletedAt !== null) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, exercise.workoutPlanId),
    columns: { versionStatus: true },
  });

  if (!plan) {
    return Response.json({ error: "Exercise not found" }, { status: 404 });
  }

  if (plan.versionStatus !== "draft") {
    return Response.json(
      { error: "Can only delete exercises from a draft plan." },
      { status: 409 },
    );
  }

  await db
    .update(exercises)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(eq(exercises.id, id));

  return new Response(null, { status: 204 });
}

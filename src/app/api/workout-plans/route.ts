import type { NextRequest } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { workoutPlans } from "@/db/schema";
import { createWorkoutPlan, type ExerciseInput } from "@/db/queries/workout-plans";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const traineeId = request.nextUrl.searchParams.get("traineeId");
  if (!traineeId) {
    return Response.json({ error: "traineeId query param is required" }, { status: 400 });
  }

  const plans = await db.query.workoutPlans.findMany({
    where: eq(workoutPlans.traineeId, traineeId),
    orderBy: [desc(workoutPlans.occurredAt)],
    with: {
      exercises: {
        orderBy: (ex, { asc }) => [asc(ex.createdAt)],
      },
    },
  });

  return Response.json({ data: plans });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    traineeId?: string;
    name?: string;
    occurredAt?: string;
    comment?: string;
    exercises?: ExerciseInput[];
  };

  if (!body.traineeId || !body.name?.trim()) {
    return Response.json({ error: "traineeId and name are required" }, { status: 400 });
  }

  const plan = await createWorkoutPlan({
    traineeId: body.traineeId,
    name: body.name.trim(),
    occurredAt: body.occurredAt ? new Date(body.occurredAt) : new Date(),
    comment: body.comment,
    createdBy: user.id,
    exerciseInputs: body.exercises ?? [],
  });

  return Response.json({ data: plan }, { status: 201 });
}

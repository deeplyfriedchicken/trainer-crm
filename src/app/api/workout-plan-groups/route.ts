import type { NextRequest } from "next/server";
import { createWorkoutPlan, type ExerciseInput } from "@/db/queries/workout-plans";
import { listWorkoutPlanGroupsForTrainee } from "@/db/queries/workout-plan-groups";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const traineeId = request.nextUrl.searchParams.get("traineeId");
  if (!traineeId) {
    return Response.json(
      { error: "traineeId query param is required" },
      { status: 400 },
    );
  }

  const groups = await listWorkoutPlanGroupsForTrainee(traineeId);
  return Response.json({ data: groups });
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
    return Response.json(
      { error: "traineeId and name are required" },
      { status: 400 },
    );
  }

  // createWorkoutPlan auto-creates a group when no workoutPlanGroupId is supplied.
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

import { and, desc, eq, isNull } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import {
  createWorkoutPlan,
  type ExerciseInput,
} from "@/db/queries/workout-plans";
import { workoutPlans } from "@/db/schema";
import { getRequestUser } from "@/lib/request-auth";

// @query traineeId: string (required)
// @invokes db.query.workoutPlans.findMany({ where: traineeId, with: exercises, orderBy: createdAt desc })
// @errors 400 traineeId required | 401 unauthorized
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

  const plans = await db.query.workoutPlans.findMany({
    where: and(
      eq(workoutPlans.traineeId, traineeId),
      isNull(workoutPlans.deletedAt),
    ),
    orderBy: [desc(workoutPlans.createdAt)],
    with: {
      exercises: {
        where: (ex, { isNull }) => isNull(ex.deletedAt),
        orderBy: (ex, { asc }) => [asc(ex.createdAt)],
      },
    },
  });

  return Response.json({ data: plans });
}

// @body { traineeId: string; name: string; comment?: string; exercises?: ExerciseInput[] }
// @invokes createWorkoutPlan({ traineeId, name, comment, createdBy, exerciseInputs })
// @errors 400 traineeId and name required | 401 unauthorized | 201 created
export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    traineeId?: string;
    name?: string;
    comment?: string;
    exercises?: ExerciseInput[];
    workoutPlanGroupId?: string;
  };

  if (!body.traineeId || !body.name?.trim()) {
    return Response.json(
      { error: "traineeId and name are required" },
      { status: 400 },
    );
  }

  const plan = await createWorkoutPlan({
    traineeId: body.traineeId,
    name: body.name.trim(),
    comment: body.comment,
    createdBy: user.id,
    exerciseInputs: body.exercises ?? [],
    workoutPlanGroupId: body.workoutPlanGroupId,
  });

  return Response.json({ data: plan }, { status: 201 });
}

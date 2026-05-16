import type { NextRequest } from "next/server";
import {
  createWorkoutSet,
  listSetsForWorkout,
} from "@/db/queries/workout-sets";
import { getRequestUser } from "@/lib/request-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sets = await listSetsForWorkout(id);
  return Response.json({ data: sets });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId } = await params;

  const body = (await request.json()) as {
    exerciseId?: string;
    position?: number;
    reps?: number | null;
    durationSeconds?: number | null;
    weightLbs?: number | null;
    completed?: boolean;
    startedAt?: string | null;
    endedAt?: string | null;
    rpe?: number | null;
    rir?: number | null;
    videoId?: string | null;
    comment?: string | null;
  };

  if (!body.exerciseId?.trim()) {
    return Response.json({ error: "exerciseId is required" }, { status: 400 });
  }
  if (typeof body.completed !== "boolean") {
    return Response.json({ error: "completed is required" }, { status: 400 });
  }
  if (typeof body.position !== "number" || body.position < 0) {
    return Response.json(
      { error: "position must be a non-negative integer" },
      { status: 400 },
    );
  }
  if (body.rpe != null && (body.rpe < 1 || body.rpe > 10)) {
    return Response.json({ error: "rpe must be 1–10" }, { status: 400 });
  }
  if (body.rir != null && (body.rir < 0 || body.rir > 10)) {
    return Response.json({ error: "rir must be 0–10" }, { status: 400 });
  }

  const set = await createWorkoutSet({
    workoutId,
    exerciseId: body.exerciseId,
    position: body.position,
    reps: body.reps,
    durationSeconds: body.durationSeconds,
    weightLbs: body.weightLbs,
    completed: body.completed,
    startedAt: body.startedAt ? new Date(body.startedAt) : null,
    endedAt: body.endedAt ? new Date(body.endedAt) : null,
    rpe: body.rpe,
    rir: body.rir,
    videoId: body.videoId,
    comment: body.comment,
    createdBy: user.id,
  });

  return Response.json({ data: set }, { status: 201 });
}

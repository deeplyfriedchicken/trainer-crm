import type { NextRequest } from "next/server";
import {
  deleteWorkoutSet,
  updateWorkoutSet,
} from "@/db/queries/workout-sets";
import { getRequestUser } from "@/lib/request-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId, setId } = await params;

  const body = (await request.json()) as {
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

  if (body.rpe != null && (body.rpe < 1 || body.rpe > 10)) {
    return Response.json({ error: "rpe must be 1–10" }, { status: 400 });
  }
  if (body.rir != null && (body.rir < 0 || body.rir > 10)) {
    return Response.json({ error: "rir must be 0–10" }, { status: 400 });
  }

  const set = await updateWorkoutSet({
    setId,
    workoutId,
    reps: body.reps,
    durationSeconds: body.durationSeconds,
    weightLbs: body.weightLbs,
    completed: body.completed,
    startedAt: body.startedAt !== undefined
      ? body.startedAt ? new Date(body.startedAt) : null
      : undefined,
    endedAt: body.endedAt !== undefined
      ? body.endedAt ? new Date(body.endedAt) : null
      : undefined,
    rpe: body.rpe,
    rir: body.rir,
    videoId: body.videoId,
    comment: body.comment,
    updatedBy: user.id,
  });

  if (!set) return Response.json({ error: "Set not found" }, { status: 404 });
  return Response.json({ data: set });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; setId: string }> },
) {
  const user = await getRequestUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id: workoutId, setId } = await params;
  await deleteWorkoutSet(setId, workoutId);
  return new Response(null, { status: 204 });
}

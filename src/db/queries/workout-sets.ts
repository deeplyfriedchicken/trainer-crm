import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { workoutSets } from "@/db/schema";
import { recomputeWorkoutAggregates } from "./workouts";

export async function listSetsForWorkout(workoutId: string) {
  return db.query.workoutSets.findMany({
    where: eq(workoutSets.workoutId, workoutId),
    orderBy: [asc(workoutSets.exerciseId), asc(workoutSets.position)],
  });
}

export async function createWorkoutSet({
  workoutId,
  exerciseId,
  position,
  reps,
  durationSeconds,
  weightLbs,
  completed,
  startedAt,
  endedAt,
  rpe,
  rir,
  videoId,
  comment,
  createdBy,
}: {
  workoutId: string;
  exerciseId: string;
  position: number;
  reps?: number | null;
  durationSeconds?: number | null;
  weightLbs?: number | null;
  completed: boolean;
  startedAt?: Date | null;
  endedAt?: Date | null;
  rpe?: number | null;
  rir?: number | null;
  videoId?: string | null;
  comment?: string | null;
  createdBy: string;
}) {
  return db.transaction(async (tx) => {
    const [set] = await tx
      .insert(workoutSets)
      .values({
        workoutId,
        exerciseId,
        position,
        reps: reps ?? null,
        durationSeconds: durationSeconds ?? null,
        weightLbs: weightLbs ?? null,
        completed,
        startedAt: startedAt ?? null,
        endedAt: endedAt ?? null,
        rpe: rpe ?? null,
        rir: rir ?? null,
        videoId: videoId ?? null,
        comment: comment ?? null,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    await recomputeWorkoutAggregates(tx, workoutId);
    return set;
  });
}

export async function updateWorkoutSet({
  setId,
  workoutId,
  reps,
  durationSeconds,
  weightLbs,
  completed,
  startedAt,
  endedAt,
  rpe,
  rir,
  videoId,
  comment,
  updatedBy,
}: {
  setId: string;
  workoutId: string;
  reps?: number | null;
  durationSeconds?: number | null;
  weightLbs?: number | null;
  completed?: boolean;
  startedAt?: Date | null;
  endedAt?: Date | null;
  rpe?: number | null;
  rir?: number | null;
  videoId?: string | null;
  comment?: string | null;
  updatedBy: string;
}) {
  return db.transaction(async (tx) => {
    const [set] = await tx
      .update(workoutSets)
      .set({
        ...(reps !== undefined && { reps }),
        ...(durationSeconds !== undefined && { durationSeconds }),
        ...(weightLbs !== undefined && { weightLbs }),
        ...(completed !== undefined && { completed }),
        ...(startedAt !== undefined && { startedAt }),
        ...(endedAt !== undefined && { endedAt }),
        ...(rpe !== undefined && { rpe }),
        ...(rir !== undefined && { rir }),
        ...(videoId !== undefined && { videoId }),
        ...(comment !== undefined && { comment }),
        updatedBy,
      })
      .where(
        and(eq(workoutSets.id, setId), eq(workoutSets.workoutId, workoutId)),
      )
      .returning();

    await recomputeWorkoutAggregates(tx, workoutId);
    return set;
  });
}

export async function deleteWorkoutSet(setId: string, workoutId: string) {
  return db.transaction(async (tx) => {
    await tx
      .delete(workoutSets)
      .where(
        and(eq(workoutSets.id, setId), eq(workoutSets.workoutId, workoutId)),
      );
    await recomputeWorkoutAggregates(tx, workoutId);
  });
}

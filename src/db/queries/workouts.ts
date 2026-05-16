import { avg, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { painFlags, workoutExercises, workouts, workoutSets } from "@/db/schema";

export type SetInput = {
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
};

export async function recomputeWorkoutAggregates(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  workoutId: string,
) {
  const [setAgg] = await tx
    .select({
      totalVolumeLbs: sql<number | null>`NULLIF(SUM(
        CASE WHEN ${workoutSets.completed} AND ${workoutSets.reps} IS NOT NULL AND ${workoutSets.weightLbs} IS NOT NULL
             THEN ${workoutSets.weightLbs} * ${workoutSets.reps}
             ELSE 0 END
      ), 0)`,
      totalWorkSeconds: sql<number | null>`NULLIF(SUM(
        CASE WHEN ${workoutSets.completed} AND ${workoutSets.durationSeconds} IS NOT NULL
             THEN ${workoutSets.durationSeconds}
             ELSE 0 END
      ), 0)`,
      adherencePercent: sql<number | null>`ROUND(
        100.0 * COUNT(CASE WHEN ${workoutSets.completed} THEN 1 END)::numeric
          / NULLIF(COUNT(*), 0),
        2
      )::real`,
      averageRpe: avg(workoutSets.rpe),
    })
    .from(workoutSets)
    .where(eq(workoutSets.workoutId, workoutId));

  const [flagAgg] = await tx
    .select({ painFlagCount: count() })
    .from(painFlags)
    .where(eq(painFlags.workoutId, workoutId));

  await tx
    .update(workouts)
    .set({
      totalVolumeLbs: setAgg?.totalVolumeLbs ?? null,
      totalWorkSeconds: setAgg?.totalWorkSeconds ?? null,
      adherencePercent: setAgg?.adherencePercent ?? null,
      averageRpe: setAgg?.averageRpe != null ? Number(setAgg.averageRpe) : null,
      painFlagCount: flagAgg?.painFlagCount ?? 0,
    })
    .where(eq(workouts.id, workoutId));
}

export async function createWorkout({
  traineeId,
  workoutPlanId,
  durationSeconds,
  painRating,
  postSessionEnergy,
  preSessionEnergy,
  preSessionSoreness,
  preSessionStress,
  preSessionNote,
  comment,
  sets,
  createdBy,
}: {
  traineeId: string;
  workoutPlanId: string | null;
  durationSeconds: number;
  painRating?: number | null;
  postSessionEnergy?: number | null;
  preSessionEnergy?: number | null;
  preSessionSoreness?: number | null;
  preSessionStress?: number | null;
  preSessionNote?: string | null;
  comment?: string | null;
  sets: SetInput[];
  createdBy: string;
}) {
  return db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workouts)
      .values({
        traineeId,
        workoutPlanId,
        durationSeconds,
        painRating: painRating ?? null,
        postSessionEnergy: postSessionEnergy ?? null,
        preSessionEnergy: preSessionEnergy ?? null,
        preSessionSoreness: preSessionSoreness ?? null,
        preSessionStress: preSessionStress ?? null,
        preSessionNote: preSessionNote ?? null,
        comment: comment ?? null,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    if (sets.length > 0) {
      // Insert workout_exercises join rows (one per unique exercise).
      const uniqueExerciseIds = [...new Set(sets.map((s) => s.exerciseId))];
      await tx.insert(workoutExercises).values(
        uniqueExerciseIds.map((exerciseId) => ({
          workoutId: workout.id,
          exerciseId,
          createdBy,
          updatedBy: createdBy,
        })),
      );

      // Insert individual set rows.
      await tx.insert(workoutSets).values(
        sets.map((s) => ({
          workoutId: workout.id,
          exerciseId: s.exerciseId,
          position: s.position,
          reps: s.reps ?? null,
          durationSeconds: s.durationSeconds ?? null,
          weightLbs: s.weightLbs ?? null,
          completed: s.completed,
          startedAt: s.startedAt ?? null,
          endedAt: s.endedAt ?? null,
          rpe: s.rpe ?? null,
          rir: s.rir ?? null,
          videoId: s.videoId ?? null,
          comment: s.comment ?? null,
          createdBy,
          updatedBy: createdBy,
        })),
      );

      await recomputeWorkoutAggregates(tx, workout.id);
    }

    return workout;
  });
}

export async function listWorkoutsForTrainee(traineeId: string) {
  return db.query.workouts.findMany({
    where: eq(workouts.traineeId, traineeId),
    orderBy: [desc(workouts.createdAt)],
    with: {
      workoutPlan: {
        columns: { id: true, name: true, occurredAt: true },
      },
      exerciseLinks: {
        with: {
          exercise: {
            columns: {
              id: true,
              name: true,
              type: true,
              sets: true,
              reps: true,
              durationSeconds: true,
              weightLbs: true,
            },
          },
        },
      },
    },
  });
}

export type WorkoutRow = Awaited<
  ReturnType<typeof listWorkoutsForTrainee>
>[number];

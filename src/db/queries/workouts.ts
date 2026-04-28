import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { type WorkoutSetLog, workoutExercises, workouts } from "@/db/schema";

export type ExerciseLogEntry = {
  exerciseId: string;
  sets: WorkoutSetLog[];
};

export async function createWorkout({
  traineeId,
  workoutPlanId,
  durationSeconds,
  painRating,
  energyRating,
  comment,
  exerciseLogs,
  createdBy,
}: {
  traineeId: string;
  workoutPlanId: string | null;
  durationSeconds: number;
  painRating: number | null;
  energyRating: number | null;
  comment: string | null;
  exerciseLogs: ExerciseLogEntry[];
  createdBy: string;
}) {
  return db.transaction(async (tx) => {
    const [workout] = await tx
      .insert(workouts)
      .values({
        traineeId,
        workoutPlanId,
        durationSeconds,
        painRating,
        energyRating,
        comment,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    if (exerciseLogs.length > 0) {
      await tx.insert(workoutExercises).values(
        exerciseLogs.map(({ exerciseId, sets }) => ({
          workoutId: workout.id,
          exerciseId,
          setsData: sets,
          createdBy,
          updatedBy: createdBy,
        })),
      );
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
            columns: { id: true, name: true, type: true, sets: true, reps: true, durationSeconds: true, weightLbs: true },
          },
        },
      },
    },
  });
}

export type WorkoutRow = Awaited<ReturnType<typeof listWorkoutsForTrainee>>[number];

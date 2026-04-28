import { eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises, exerciseVideos, workoutPlans } from "@/db/schema";

export type ExerciseInput = {
  name: string;
  type: "reps" | "duration";
  sets: number;
  reps?: number | null;
  durationSeconds?: number | null;
  weightLbs?: number | null;
  comment?: string | null;
  videoIds?: string[];
};

async function insertExercises(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  workoutPlanId: string,
  inputs: ExerciseInput[],
  userId: string,
) {
  for (const ex of inputs) {
    const [exercise] = await tx
      .insert(exercises)
      .values({
        workoutPlanId,
        name: ex.name,
        type: ex.type,
        sets: ex.sets,
        reps: ex.type === "reps" ? (ex.reps ?? null) : null,
        durationSeconds: ex.type === "duration" ? (ex.durationSeconds ?? null) : null,
        weightLbs: ex.weightLbs ?? null,
        comment: ex.comment ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    for (const videoId of ex.videoIds ?? []) {
      await tx
        .insert(exerciseVideos)
        .values({ exerciseId: exercise.id, videoId, createdBy: userId, updatedBy: userId });
    }
  }
}

export async function createWorkoutPlan({
  traineeId,
  name,
  occurredAt,
  comment,
  createdBy,
  exerciseInputs,
}: {
  traineeId: string;
  name: string;
  occurredAt: Date;
  comment?: string | null;
  createdBy: string;
  exerciseInputs: ExerciseInput[];
}) {
  return db.transaction(async (tx) => {
    const [plan] = await tx
      .insert(workoutPlans)
      .values({ traineeId, name, occurredAt, comment: comment ?? null, createdBy, updatedBy: createdBy })
      .returning();

    await insertExercises(tx, plan.id, exerciseInputs, createdBy);
    return plan;
  });
}

export async function updateWorkoutPlan({
  planId,
  name,
  occurredAt,
  comment,
  updatedBy,
  exerciseInputs,
}: {
  planId: string;
  name: string;
  occurredAt: Date;
  comment?: string | null;
  updatedBy: string;
  exerciseInputs: ExerciseInput[];
}) {
  return db.transaction(async (tx) => {
    const [plan] = await tx
      .update(workoutPlans)
      .set({ name, occurredAt, comment: comment ?? null, updatedBy })
      .where(eq(workoutPlans.id, planId))
      .returning();

    // Cascade delete removes exercise_videos; re-insert fresh.
    await tx.delete(exercises).where(eq(exercises.workoutPlanId, planId));
    await insertExercises(tx, planId, exerciseInputs, updatedBy);
    return plan;
  });
}

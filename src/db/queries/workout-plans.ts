import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { exercises, exerciseVideos, workoutPlans } from "@/db/schema";

export type ExerciseInput = {
  id?: string;
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
  inputs: { input: ExerciseInput; position: number }[],
  userId: string,
) {
  for (const { input: ex, position } of inputs) {
    const [exercise] = await tx
      .insert(exercises)
      .values({
        workoutPlanId,
        name: ex.name,
        type: ex.type,
        sets: ex.sets,
        reps: ex.type === "reps" ? (ex.reps ?? null) : null,
        durationSeconds:
          ex.type === "duration" ? (ex.durationSeconds ?? null) : null,
        weightLbs: ex.weightLbs ?? null,
        position,
        comment: ex.comment ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    for (const videoId of ex.videoIds ?? []) {
      await tx.insert(exerciseVideos).values({
        exerciseId: exercise.id,
        videoId,
        createdBy: userId,
        updatedBy: userId,
      });
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
      .values({
        traineeId,
        name,
        occurredAt,
        comment: comment ?? null,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();

    await insertExercises(
      tx,
      plan.id,
      exerciseInputs.map((input, position) => ({ input, position })),
      createdBy,
    );
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

    // Tag each input with its array index — that index is the new `position`,
    // applied to both updates and inserts so the array order becomes the
    // canonical display order.
    const indexed = exerciseInputs.map((input, position) => ({
      input,
      position,
    }));
    const toUpdate = indexed.filter((e) => e.input.id != null);
    const toInsert = indexed.filter((e) => e.input.id == null);
    const retainedIds = new Set(toUpdate.map((e) => e.input.id!));

    // Fetch current active exercises to find which ones were removed.
    // Soft-delete removed exercises instead of hard-deleting — hard deletes
    // cascade into workout_exercises and permanently erase logged workout history.
    const current = await tx
      .select({ id: exercises.id })
      .from(exercises)
      .where(eq(exercises.workoutPlanId, planId));

    const toSoftDelete = current
      .filter((e) => !retainedIds.has(e.id))
      .map((e) => e.id);

    if (toSoftDelete.length > 0) {
      await tx
        .update(exercises)
        .set({ deletedAt: new Date() })
        .where(inArray(exercises.id, toSoftDelete));
    }

    // Update existing exercises in place — preserves their IDs so
    // workout_exercises rows (logged workout history) remain linked.
    for (const { input: ex, position } of toUpdate) {
      await tx
        .update(exercises)
        .set({
          name: ex.name,
          type: ex.type,
          sets: ex.sets,
          reps: ex.type === "reps" ? (ex.reps ?? null) : null,
          durationSeconds:
            ex.type === "duration" ? (ex.durationSeconds ?? null) : null,
          weightLbs: ex.weightLbs ?? null,
          position,
          comment: ex.comment ?? null,
          deletedAt: null,
          updatedBy,
        })
        .where(eq(exercises.id, ex.id!));

      await tx
        .delete(exerciseVideos)
        .where(eq(exerciseVideos.exerciseId, ex.id!));
      for (const videoId of ex.videoIds ?? []) {
        await tx.insert(exerciseVideos).values({
          exerciseId: ex.id!,
          videoId,
          createdBy: updatedBy,
          updatedBy,
        });
      }
    }

    await insertExercises(tx, planId, toInsert, updatedBy);
    return plan;
  });
}

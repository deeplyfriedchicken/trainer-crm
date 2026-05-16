import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  exercises,
  exerciseVideos,
  workoutPlanGroups,
  workoutPlans,
} from "@/db/schema";

export type ExerciseInput = {
  id?: string;
  name: string;
  type: "reps" | "duration";
  sets: number;
  reps?: number | null;
  durationSeconds?: number | null;
  weightLbs?: number | null;
  isHidden?: boolean;
  comment?: string | null;
  videoIds?: string[];
};

export async function insertExercises(
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
        isHidden: ex.isHidden ?? false,
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
  workoutPlanGroupId,
}: {
  traineeId: string;
  name: string;
  occurredAt: Date;
  comment?: string | null;
  createdBy: string;
  exerciseInputs: ExerciseInput[];
  workoutPlanGroupId?: string;
}) {
  return db.transaction(async (tx) => {
    // Auto-create a group if one wasn't supplied.
    let groupId = workoutPlanGroupId;
    if (!groupId) {
      const [group] = await tx
        .insert(workoutPlanGroups)
        .values({ traineeId, name, createdBy, updatedBy: createdBy })
        .returning();
      groupId = group.id;
    }

    const [plan] = await tx
      .insert(workoutPlans)
      .values({
        traineeId,
        workoutPlanGroupId: groupId,
        name,
        occurredAt,
        comment: comment ?? null,
        versionStatus: "draft",
        versionNumber: 1,
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

    // Point the group at this first plan as its current version.
    await tx
      .update(workoutPlanGroups)
      .set({ currentVersionId: plan.id, updatedBy: createdBy })
      .where(eq(workoutPlanGroups.id, groupId));

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

    const indexed = exerciseInputs.map((input, position) => ({
      input,
      position,
    }));
    const toUpdate = indexed.filter((e) => e.input.id != null);
    const toInsert = indexed.filter((e) => e.input.id == null);
    const retainedIds = new Set(toUpdate.map((e) => e.input.id!));

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
          isHidden: ex.isHidden ?? false,
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

"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { createMessage } from "@/db/queries/chats";
import {
  createWorkoutPlan,
  type ExerciseInput,
  forkDraftFromPublished,
  updateWorkoutPlan,
} from "@/db/queries/workout-plans";
import {
  exercises,
  users,
  workoutPlanGroups,
  workoutPlans,
  workouts,
} from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function resetTraineePin(traineeId: string) {
  const currentUser = await getCurrentUser();
  const canReset = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );
  if (!canReset) throw new Error("Unauthorized");

  await db
    .update(users)
    .set({ pin: null, pinUpdatedAt: new Date() })
    .where(eq(users.id, traineeId));
  revalidatePath(`/dashboard/trainees/${traineeId}`);
}

export async function sendMessage(chatId: string, text: string) {
  const user = await getCurrentUser();
  return createMessage(chatId, user.id, { text });
}

export async function createPlan(
  traineeId: string,
  data: {
    name: string;
    occurredAt: Date;
    comment?: string | null;
    exercises: ExerciseInput[];
  },
) {
  const user = await getCurrentUser();
  return createWorkoutPlan({
    traineeId,
    name: data.name,
    occurredAt: data.occurredAt,
    comment: data.comment,
    createdBy: user.id,
    exerciseInputs: data.exercises,
  });
}

export async function publishDraftPlan(planId: string, traineeId: string) {
  const user = await getCurrentUser();

  await db.transaction(async (tx) => {
    const [plan] = await tx
      .select({
        id: workoutPlans.id,
        traineeId: workoutPlans.traineeId,
        workoutPlanGroupId: workoutPlans.workoutPlanGroupId,
      })
      .from(workoutPlans)
      .where(eq(workoutPlans.id, planId));

    if (!plan || plan.traineeId !== traineeId) throw new Error("Not found");

    const now = new Date();

    // Archive the current published version in this group before promoting.
    if (plan.workoutPlanGroupId) {
      await tx
        .update(workoutPlans)
        .set({ versionStatus: "archived", updatedBy: user.id })
        .where(
          and(
            eq(workoutPlans.workoutPlanGroupId, plan.workoutPlanGroupId),
            eq(workoutPlans.versionStatus, "published"),
          ),
        );
    }

    await tx
      .update(workoutPlans)
      .set({ versionStatus: "published", publishedAt: now, updatedBy: user.id })
      .where(eq(workoutPlans.id, planId));

    if (plan.workoutPlanGroupId) {
      await tx
        .update(workoutPlanGroups)
        .set({ currentVersionId: planId, updatedBy: user.id })
        .where(eq(workoutPlanGroups.id, plan.workoutPlanGroupId));
    }
  });

  revalidatePath(`/dashboard/trainees/${traineeId}`);
}

export async function updateSessionQuality(
  workoutId: string,
  quality: number,
  traineeId: string,
) {
  const user = await getCurrentUser();
  await db
    .update(workouts)
    .set({
      sessionQuality: quality,
      sessionQualityRatedBy: user.id,
      sessionQualityRatedAt: new Date(),
      updatedBy: user.id,
    })
    .where(eq(workouts.id, workoutId));
  revalidatePath(`/dashboard/trainees/${traineeId}`);
}

export async function deleteExercise(exerciseId: string, traineeId: string) {
  const user = await getCurrentUser();

  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    columns: { id: true, workoutPlanId: true, deletedAt: true },
    with: {
      workoutPlan: { columns: { versionStatus: true, traineeId: true } },
    },
  });

  if (!exercise || exercise.deletedAt !== null) throw new Error("Not found");
  if (exercise.workoutPlan.traineeId !== traineeId) throw new Error("Not found");
  if (exercise.workoutPlan.versionStatus !== "draft") {
    throw new Error("Can only delete exercises from a draft plan");
  }

  await db
    .update(exercises)
    .set({ deletedAt: new Date(), updatedBy: user.id })
    .where(eq(exercises.id, exerciseId));

  revalidatePath(`/dashboard/trainees/${traineeId}`);
}

export async function updatePlan(
  planId: string,
  data: {
    name: string;
    occurredAt: Date;
    comment?: string | null;
    exercises: ExerciseInput[];
  },
) {
  const user = await getCurrentUser();

  const existing = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, planId),
    columns: {
      id: true,
      versionStatus: true,
      workoutPlanGroupId: true,
      occurredAt: true,
      comment: true,
    },
  });
  if (!existing) throw new Error("Plan not found");

  if (existing.versionStatus === "archived") {
    throw new Error("Cannot edit an archived plan");
  }

  if (existing.versionStatus === "draft") {
    return updateWorkoutPlan({
      planId,
      name: data.name,
      occurredAt: data.occurredAt,
      comment: data.comment,
      updatedBy: user.id,
      exerciseInputs: data.exercises,
    });
  }

  // Published — find or create a draft in the same group.
  const groupId = existing.workoutPlanGroupId;
  const existingDraft = groupId
    ? await db.query.workoutPlans.findFirst({
        where: and(
          eq(workoutPlans.workoutPlanGroupId, groupId),
          eq(workoutPlans.versionStatus, "draft"),
          isNull(workoutPlans.deletedAt),
        ),
      })
    : null;

  if (existingDraft) {
    return updateWorkoutPlan({
      planId: existingDraft.id,
      name: data.name,
      occurredAt: data.occurredAt,
      comment: data.comment,
      updatedBy: user.id,
      exerciseInputs: data.exercises,
    });
  }

  return forkDraftFromPublished({
    publishedPlanId: planId,
    name: data.name,
    occurredAt: data.occurredAt,
    comment: data.comment,
    exerciseInputs: data.exercises,
    createdBy: user.id,
  });
}

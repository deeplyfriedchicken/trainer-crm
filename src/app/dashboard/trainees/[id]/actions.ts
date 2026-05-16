"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { createMessage } from "@/db/queries/chats";
import {
  createWorkoutPlan,
  type ExerciseInput,
  updateWorkoutPlan,
} from "@/db/queries/workout-plans";
import { users, workoutPlanGroups, workoutPlans, workouts } from "@/db/schema";
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
  return updateWorkoutPlan({
    planId,
    name: data.name,
    occurredAt: data.occurredAt,
    comment: data.comment,
    updatedBy: user.id,
    exerciseInputs: data.exercises,
  });
}

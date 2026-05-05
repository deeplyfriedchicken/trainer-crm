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
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export async function resetTraineePin(traineeId: string) {
  const currentUser = await getCurrentUser();
  const canReset = currentUser.roles.some((r) =>
    (["admin", "trainer_manager", "trainer"] as const).includes(r as never),
  );
  if (!canReset) throw new Error("Unauthorized");

  await db.update(users).set({ pin: null, pinUpdatedAt: new Date() }).where(eq(users.id, traineeId));
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

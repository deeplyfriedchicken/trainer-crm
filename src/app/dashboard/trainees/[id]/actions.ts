"use server";

import { createMessage } from "@/db/queries/chats";
import { type ExerciseInput, createWorkoutPlan, updateWorkoutPlan } from "@/db/queries/workout-plans";
import { getCurrentUser } from "@/lib/auth";

export async function sendMessage(chatId: string, text: string) {
  const user = await getCurrentUser();
  return createMessage(chatId, user.id, { text });
}

export async function createPlan(
  traineeId: string,
  data: { name: string; occurredAt: Date; comment?: string | null; exercises: ExerciseInput[] },
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
  data: { name: string; occurredAt: Date; comment?: string | null; exercises: ExerciseInput[] },
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

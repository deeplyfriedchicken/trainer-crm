"use server";

import { createMessage } from "@/db/queries/chats";
import { createCoachingSession, updateCoachingSession } from "@/db/queries/sessions";
import { getCurrentUser } from "@/lib/auth";

export async function sendMessage(chatId: string, text: string) {
  const user = await getCurrentUser();
  return createMessage(chatId, user.id, { text });
}

type ExerciseInput = {
  name: string;
  sets: number;
  reps: number;
  comment?: string | null;
  videoIds?: string[];
};

export async function createSession(
  traineeId: string,
  data: { occurredAt: Date; comment?: string | null; exercises: ExerciseInput[] },
) {
  const user = await getCurrentUser();
  return createCoachingSession({
    traineeId,
    occurredAt: data.occurredAt,
    comment: data.comment,
    createdBy: user.id,
    exerciseInputs: data.exercises,
  });
}

export async function updateSession(
  sessionId: string,
  data: { occurredAt: Date; comment?: string | null; exercises: ExerciseInput[] },
) {
  const user = await getCurrentUser();
  return updateCoachingSession({
    sessionId,
    occurredAt: data.occurredAt,
    comment: data.comment,
    updatedBy: user.id,
    exerciseInputs: data.exercises,
  });
}

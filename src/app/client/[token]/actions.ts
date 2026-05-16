"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { createMessage } from "@/db/queries/chats";
import { createWorkout, type SetInput } from "@/db/queries/workouts";
import { users } from "@/db/schema";
import { hashPin, verifyPin } from "@/lib/client-pin";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "@/db/queries/push";
import {
  createClientSession,
  deleteClientSession,
  getClientSession,
} from "@/lib/client-session";
import { decryptUserId } from "@/lib/client-token";

export async function authenticate(
  token: string,
  pin: string,
  isCreating: boolean,
): Promise<{ error?: string }> {
  const traineeId = decryptUserId(token);
  if (!traineeId) return { error: "Invalid link." };

  if (!/^\d{6}$/.test(pin)) return { error: "PIN must be 6 digits." };

  const user = await db.query.users.findFirst({
    where: eq(users.id, traineeId),
    columns: { id: true, pin: true },
  });

  if (!user) return { error: "Account not found." };

  if (isCreating) {
    const hashed = await hashPin(pin);
    await db
      .update(users)
      .set({ pin: hashed, pinUpdatedAt: new Date() })
      .where(eq(users.id, traineeId));
  } else {
    if (!user.pin) return { error: "No PIN set. Please contact your trainer." };
    const valid = await verifyPin(pin, user.pin);
    if (!valid) return { error: "Incorrect PIN. Please try again." };
  }

  await createClientSession(traineeId);
  redirect(`/client/${token}`);
}

export async function sendClientMessage(chatId: string, text: string) {
  const session = await getClientSession();
  if (!session) throw new Error("Unauthorized");
  return createMessage(chatId, session.traineeId, { text });
}

export async function fetchClientMessages(chatId: string) {
  const session = await getClientSession();
  if (!session) throw new Error("Unauthorized");
  const { getChatMessages } = await import("@/db/queries/chats");
  return getChatMessages(chatId);
}

export async function registerPushSubscription(
  endpoint: string,
  p256dh: string,
  auth: string,
): Promise<void> {
  const session = await getClientSession();
  if (!session) throw new Error("Unauthorized");
  await upsertPushSubscription(session.traineeId, endpoint, p256dh, auth);
}

export async function unregisterPushSubscription(
  endpoint: string,
): Promise<void> {
  const session = await getClientSession();
  if (!session) throw new Error("Unauthorized");
  await deletePushSubscription(endpoint);
}

export async function logout(token: string): Promise<void> {
  await deleteClientSession();
  redirect(`/client/${token}`);
}

export async function completeWorkout(
  token: string,
  planId: string,
  feedback: {
    pain: number | null;
    energy: number | null;
    preEnergy: number | null;
    preStress: number | null;
    preSoreness: number | null;
    comment: string;
    durationSeconds: number;
    sets: SetInput[];
  },
): Promise<{ error?: string }> {
  const traineeId = decryptUserId(token);
  if (!traineeId) return { error: "Invalid link." };

  const clientSession = await getClientSession();
  if (clientSession?.traineeId !== traineeId)
    return { error: "Not authenticated." };

  await createWorkout({
    traineeId,
    workoutPlanId: planId,
    durationSeconds: Math.max(0, feedback.durationSeconds),
    painRating: feedback.pain,
    postSessionEnergy: feedback.energy,
    preSessionEnergy: feedback.preEnergy,
    preSessionStress: feedback.preStress,
    preSessionSoreness: feedback.preSoreness,
    comment: feedback.comment || null,
    sets: feedback.sets,
    createdBy: traineeId,
  });

  redirect(`/client/${token}`);
}

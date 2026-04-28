"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { type ExerciseLogEntry, createWorkout } from "@/db/queries/workouts";
import { hashPin, verifyPin } from "@/lib/client-pin";
import { createClientSession, deleteClientSession, getClientSession } from "@/lib/client-session";
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
    comment: string;
    durationSeconds: number;
    exerciseLogs: ExerciseLogEntry[];
  },
): Promise<{ error?: string }> {
  const traineeId = decryptUserId(token);
  if (!traineeId) return { error: "Invalid link." };

  const clientSession = await getClientSession();
  if (clientSession?.traineeId !== traineeId) return { error: "Not authenticated." };

  await createWorkout({
    traineeId,
    workoutPlanId: planId,
    durationSeconds: Math.max(0, feedback.durationSeconds),
    painRating: feedback.pain,
    energyRating: feedback.energy,
    comment: feedback.comment || null,
    exerciseLogs: feedback.exerciseLogs,
    createdBy: traineeId,
  });

  redirect(`/client/${token}`);
}

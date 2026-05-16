import { eq } from "drizzle-orm";
import { db } from "@/db";
import { painFlags } from "@/db/schema";
import { PAIN_LOCATIONS } from "@/lib/constants";
import { recomputeWorkoutAggregates } from "./workouts";

export async function createPainFlag({
  workoutId,
  exerciseId,
  workoutSetId,
  location,
  severity,
  isRecurring,
  note,
  createdBy,
}: {
  workoutId: string;
  exerciseId?: string | null;
  workoutSetId?: string | null;
  location: string;
  severity: number;
  isRecurring?: boolean;
  note?: string | null;
  createdBy: string;
}) {
  if (!(PAIN_LOCATIONS as readonly string[]).includes(location)) {
    throw new Error(`Invalid pain location: ${location}`);
  }

  return db.transaction(async (tx) => {
    const [flag] = await tx
      .insert(painFlags)
      .values({
        workoutId,
        exerciseId: exerciseId ?? null,
        workoutSetId: workoutSetId ?? null,
        location,
        severity,
        isRecurring: isRecurring ?? false,
        note: note ?? null,
        createdBy,
      })
      .returning();

    await recomputeWorkoutAggregates(tx, workoutId);
    return flag;
  });
}

export async function listPainFlagsForWorkout(workoutId: string) {
  return db.query.painFlags.findMany({
    where: eq(painFlags.workoutId, workoutId),
    orderBy: [painFlags.createdAt],
  });
}

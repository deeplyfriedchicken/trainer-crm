import { eq } from "drizzle-orm";
import { db } from "@/db";
import { coachingSessions, exercises, exerciseVideos } from "@/db/schema";

type ExerciseInput = {
  name: string;
  sets: number;
  reps: number;
  comment?: string | null;
  videoIds?: string[];
};

async function insertExercises(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  sessionId: string,
  inputs: ExerciseInput[],
  userId: string,
) {
  for (const ex of inputs) {
    const [exercise] = await tx
      .insert(exercises)
      .values({
        sessionId,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        comment: ex.comment || null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    for (const videoId of ex.videoIds ?? []) {
      await tx
        .insert(exerciseVideos)
        .values({ exerciseId: exercise.id, videoId, createdBy: userId, updatedBy: userId });
    }
  }
}

export async function createCoachingSession({
  traineeId,
  occurredAt,
  comment,
  createdBy,
  exerciseInputs,
}: {
  traineeId: string;
  occurredAt: Date;
  comment?: string | null;
  createdBy: string;
  exerciseInputs: ExerciseInput[];
}) {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .insert(coachingSessions)
      .values({ traineeId, occurredAt, comment: comment || null, createdBy, updatedBy: createdBy })
      .returning();

    await insertExercises(tx, session.id, exerciseInputs, createdBy);
    return session;
  });
}

export async function updateCoachingSession({
  sessionId,
  occurredAt,
  comment,
  updatedBy,
  exerciseInputs,
}: {
  sessionId: string;
  occurredAt: Date;
  comment?: string | null;
  updatedBy: string;
  exerciseInputs: ExerciseInput[];
}) {
  return db.transaction(async (tx) => {
    const [session] = await tx
      .update(coachingSessions)
      .set({ occurredAt, comment: comment || null, updatedBy })
      .where(eq(coachingSessions.id, sessionId))
      .returning();

    // Cascade delete removes exercise_videos; re-insert fresh.
    await tx.delete(exercises).where(eq(exercises.sessionId, sessionId));
    await insertExercises(tx, sessionId, exerciseInputs, updatedBy);
    return session;
  });
}

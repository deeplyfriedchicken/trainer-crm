import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { coachingSessions, exercises, users } from "@/db/schema";

export async function getClientData(traineeId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, traineeId),
    columns: {
      id: true,
      name: true,
      email: true,
      pin: true,
    },
    with: {
      coachingSessions: {
        orderBy: (cs, { desc }) => [desc(cs.occurredAt)],
        with: {
          exercises: {
            orderBy: (ex, { asc }) => [asc(ex.createdAt)],
            with: {
              videoLinks: {
                with: {
                  video: { columns: { id: true, title: true, fileUrl: true } },
                },
              },
            },
          },
          videoLinks: {
            with: {
              video: { columns: { id: true, title: true, fileUrl: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hasPin: user.pin !== null,
    coachingSessions: user.coachingSessions,
  };
}

export type ClientData = NonNullable<Awaited<ReturnType<typeof getClientData>>>;
export type ClientSession = ClientData["coachingSessions"][number];
export type ClientExercise = ClientSession["exercises"][number];

export async function getExerciseForClient(
  exerciseId: string,
  traineeId: string,
) {
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: {
      session: {
        columns: { traineeId: true },
      },
      videoLinks: {
        with: {
          video: {
            columns: { id: true, title: true, fileUrl: true, mimeType: true },
          },
        },
      },
    },
  });

  if (!exercise) return null;
  if (exercise.session.traineeId !== traineeId) return null;

  return exercise;
}

export type ExerciseDetail = NonNullable<
  Awaited<ReturnType<typeof getExerciseForClient>>
>;

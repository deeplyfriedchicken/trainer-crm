import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  chats,
  exercises,
  messages,
  users,
  workoutPlans,
  workoutSets,
} from "@/db/schema";

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
      workoutPlanGroups: {
        where: (g, { isNull }) => isNull(g.deletedAt),
        with: {
          currentVersion: {
            with: {
              exercises: {
                where: (ex, { isNull }) => isNull(ex.deletedAt),
                orderBy: (ex, { asc }) => [asc(ex.position)],
                with: {
                  videoLinks: {
                    with: {
                      video: {
                        columns: {
                          id: true,
                          title: true,
                          fileKey: true,
                          fileUrl: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      workouts: {
        orderBy: (w, { desc }) => [desc(w.createdAt)],
        columns: {
          id: true,
          durationSeconds: true,
          painRating: true,
          postSessionEnergy: true,
          preSessionEnergy: true,
          preSessionSoreness: true,
          preSessionStress: true,
          comment: true,
          createdAt: true,
        },
        with: {
          workoutPlan: { columns: { id: true, name: true, occurredAt: true } },
          exerciseLinks: {
            with: {
              exercise: {
                columns: {
                  id: true,
                  name: true,
                  type: true,
                  sets: true,
                  reps: true,
                  durationSeconds: true,
                  weightLbs: true,
                },
              },
            },
          },
          sets: {
            orderBy: [
              asc(workoutSets.exerciseId),
              asc(workoutSets.position),
            ],
            columns: {
              id: true,
              exerciseId: true,
              position: true,
              reps: true,
              durationSeconds: true,
              weightLbs: true,
              completed: true,
              metadata: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const workoutPlans = user.workoutPlanGroups
    .map((g) => g.currentVersion)
    .filter((v) => v !== null)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    hasPin: user.pin !== null,
    workoutPlans,
    workouts: user.workouts,
  };
}

export type ClientData = NonNullable<Awaited<ReturnType<typeof getClientData>>>;
export type ClientWorkoutPlan = ClientData["workoutPlans"][number];
export type ClientPlanExercise = ClientWorkoutPlan["exercises"][number];
export type ClientWorkout = ClientData["workouts"][number];

export async function getExerciseForClient(
  exerciseId: string,
  traineeId: string,
) {
  const exercise = await db.query.exercises.findFirst({
    where: eq(exercises.id, exerciseId),
    with: {
      workoutPlan: {
        columns: { traineeId: true },
      },
      videoLinks: {
        with: {
          video: {
            columns: {
              id: true,
              title: true,
              fileKey: true,
              fileUrl: true,
              mimeType: true,
            },
          },
        },
      },
    },
  });

  if (!exercise) return null;
  if (exercise.workoutPlan.traineeId !== traineeId) return null;

  return exercise;
}

export type ExerciseDetail = NonNullable<
  Awaited<ReturnType<typeof getExerciseForClient>>
>;

export async function getPlanForLog(planId: string, traineeId: string) {
  const plan = await db.query.workoutPlans.findFirst({
    where: eq(workoutPlans.id, planId),
    columns: {
      id: true,
      traineeId: true,
      name: true,
      occurredAt: true,
      comment: true,
    },
    with: {
      exercises: {
        where: (ex, { isNull }) => isNull(ex.deletedAt),
        orderBy: (ex, { asc }) => [asc(ex.position)],
        columns: {
          id: true,
          name: true,
          type: true,
          sets: true,
          reps: true,
          durationSeconds: true,
          weightLbs: true,
          comment: true,
        },
        with: {
          videoLinks: {
            with: {
              video: {
                columns: {
                  id: true,
                  title: true,
                  fileKey: true,
                  fileUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!plan) return null;
  if (plan.traineeId !== traineeId) return null;

  return plan;
}

export type PlanForLog = NonNullable<Awaited<ReturnType<typeof getPlanForLog>>>;

export async function getClientMetadata(traineeId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, traineeId),
    columns: { name: true },
    with: {
      workoutPlans: {
        where: (wp, { isNull }) => isNull(wp.deletedAt),
        orderBy: (wp, { desc }) => [desc(wp.occurredAt)],
        limit: 1,
        columns: { name: true },
      },
    },
  });

  if (!user) return null;

  return {
    name: user.name,
    mostRecentPlanName: user.workoutPlans[0]?.name ?? null,
  };
}

export async function getClientChat(traineeId: string) {
  const chat = await db.query.chats.findFirst({
    where: eq(chats.traineeId, traineeId),
    with: {
      messages: {
        orderBy: [asc(messages.createdAt)],
        with: { sender: { columns: { id: true, name: true, email: true } } },
      },
    },
  });
  return chat ?? null;
}

export type ClientChat = NonNullable<Awaited<ReturnType<typeof getClientChat>>>;

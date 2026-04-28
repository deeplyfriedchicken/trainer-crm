import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { exercises, users, workoutPlans, workouts } from "@/db/schema";

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
      workoutPlans: {
        orderBy: (wp, { desc }) => [desc(wp.occurredAt)],
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
        },
      },
      workouts: {
        orderBy: (w, { desc }) => [desc(w.createdAt)],
        with: {
          workoutPlan: { columns: { id: true, name: true, occurredAt: true } },
          exerciseLinks: {
            with: {
              exercise: {
                columns: { id: true, name: true, type: true, sets: true, reps: true, durationSeconds: true, weightLbs: true },
              },
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
    workoutPlans: user.workoutPlans,
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
            columns: { id: true, title: true, fileUrl: true, mimeType: true },
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

export async function getPlanForLog(
  planId: string,
  traineeId: string,
) {
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
        orderBy: (ex, { asc }) => [asc(ex.createdAt)],
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
              video: { columns: { id: true, title: true, fileUrl: true } },
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

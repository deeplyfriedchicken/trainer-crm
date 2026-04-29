import { asc, count, eq, max } from "drizzle-orm";
import { db } from "@/db";
import { users, workoutPlans } from "@/db/schema";

export type TraineeRow = Awaited<ReturnType<typeof listTrainees>>[number];

export type ListTraineesOptions = {
  limit: number;
  offset: number;
};

export async function listTrainees(options: ListTraineesOptions) {
  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      planCount: count(workoutPlans.id),
      lastPlanAt: max(workoutPlans.occurredAt),
    })
    .from(users)
    .leftJoin(workoutPlans, eq(workoutPlans.traineeId, users.id))
    .groupBy(users.id, users.email, users.name, users.createdAt, users.updatedAt)
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getTraineeById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      roles: true,
      workoutPlans: {
        orderBy: (wp, { desc }) => [desc(wp.occurredAt)],
        with: {
          exercises: {
            orderBy: (ex, { asc }) => [asc(ex.createdAt)],
            with: {
              videoLinks: {
                with: { video: { columns: { id: true, title: true, fileUrl: true } } },
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
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    workoutPlans: user.workoutPlans,
    workouts: user.workouts,
  };
}

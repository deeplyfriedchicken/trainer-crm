import { createId } from "@paralleldrive/cuid2";
import { and, asc, count, eq, isNull, max } from "drizzle-orm";
import { db } from "@/db";
import { userRoles, users, workoutPlans } from "@/db/schema";

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
    .where(isNull(users.deletedAt))
    .groupBy(
      users.id,
      users.email,
      users.name,
      users.createdAt,
      users.updatedAt,
    )
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getTraineeById(id: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deletedAt)),
    with: {
      roles: true,
      workoutPlans: {
        orderBy: (wp, { desc }) => [desc(wp.occurredAt)],
        with: {
          videoLinks: {
            with: {
              video: {
                columns: {
                  id: true,
                  title: true,
                  fileKey: true,
                  fileUrl: true,
                  durationSeconds: true,
                },
              },
            },
          },
          exercises: {
            orderBy: (ex, { asc }) => [asc(ex.createdAt)],
            with: {
              videoLinks: {
                with: {
                  video: {
                    columns: {
                      id: true,
                      title: true,
                      fileKey: true,
                      fileUrl: true,
                      durationSeconds: true,
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
        with: {
          workoutPlan: { columns: { id: true, name: true, occurredAt: true } },
          videoLinks: {
            with: {
              video: {
                columns: {
                  id: true,
                  title: true,
                  fileKey: true,
                  fileUrl: true,
                  durationSeconds: true,
                },
              },
            },
          },
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

export async function createTrainee({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ id: createId(), name, email })
      .returning();
    await tx.insert(userRoles).values({ userId: user.id, role: "trainee" });
    return user;
  });
}

export async function updateTrainee(
  id: string,
  { name, email }: { name?: string; email?: string },
) {
  const [user] = await db
    .update(users)
    .set({
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    })
    .where(eq(users.id, id))
    .returning();
  return user ?? null;
}

export async function deleteTrainee(id: string) {
  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
}

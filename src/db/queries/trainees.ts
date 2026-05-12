import { createId } from "@paralleldrive/cuid2";
import { and, asc, count, desc, eq, inArray, isNull, max } from "drizzle-orm";
import { db } from "@/db";
import { userRoles, users, videos, workoutPlans } from "@/db/schema";

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
    .leftJoin(
      workoutPlans,
      and(eq(workoutPlans.traineeId, users.id), isNull(workoutPlans.deletedAt)),
    )
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

const activeVideoIds = () =>
  db.select({ id: videos.id }).from(videos).where(isNull(videos.deletedAt));

export async function getTraineeById(id: string) {
  const user = await db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deletedAt)),
    with: {
      roles: true,
      workoutPlans: {
        where: (wp, { isNull }) => isNull(wp.deletedAt),
        orderBy: (wp, { desc }) => [desc(wp.occurredAt)],
        with: {
          videoLinks: {
            where: (vl) => inArray(vl.videoId, activeVideoIds()),
            with: {
              video: {
                columns: {
                  id: true,
                  title: true,
                  fileKey: true,
                  fileUrl: true,
                  durationSeconds: true,
                  status: true,
                },
              },
            },
          },
          exercises: {
            where: (ex, { isNull }) => isNull(ex.deletedAt),
            orderBy: (ex, { asc }) => [asc(ex.createdAt)],
            with: {
              videoLinks: {
                where: (vl) => inArray(vl.videoId, activeVideoIds()),
                with: {
                  video: {
                    columns: {
                      id: true,
                      title: true,
                      fileKey: true,
                      fileUrl: true,
                      durationSeconds: true,
                      status: true,
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
            where: (vl) => inArray(vl.videoId, activeVideoIds()),
            with: {
              video: {
                columns: {
                  id: true,
                  title: true,
                  fileKey: true,
                  fileUrl: true,
                  durationSeconds: true,
                  status: true,
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

  const directVideos = await db
    .select({
      id: videos.id,
      title: videos.title,
      fileKey: videos.fileKey,
      fileUrl: videos.fileUrl,
      durationSeconds: videos.durationSeconds,
      createdAt: videos.createdAt,
      status: videos.status,
    })
    .from(videos)
    .where(and(eq(videos.traineeId, id), isNull(videos.deletedAt)))
    .orderBy(desc(videos.createdAt));

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    directVideos,
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

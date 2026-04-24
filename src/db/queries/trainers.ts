import { and, asc, count, eq, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { trainerAssignments, userRoles, users, videos } from "@/db/schema";

export type ListTrainersOptions = {
  limit: number;
  offset: number;
};

export async function listTrainers(options: ListTrainersOptions) {
  const trainerIds = db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(sql`${userRoles.role} in ('trainer', 'trainer_manager')`);

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(inArray(users.id, trainerIds))
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const [traineeCounts, videoCounts] = await Promise.all([
    db
      .select({
        trainerId: trainerAssignments.trainerId,
        count: count(trainerAssignments.traineeId),
      })
      .from(trainerAssignments)
      .where(
        and(inArray(trainerAssignments.trainerId, ids), isNull(trainerAssignments.endedAt)),
      )
      .groupBy(trainerAssignments.trainerId),

    db
      .select({
        uploaderId: videos.uploaderId,
        count: count(videos.id),
      })
      .from(videos)
      .where(inArray(videos.uploaderId, ids))
      .groupBy(videos.uploaderId),
  ]);

  const traineeCountMap = new Map(traineeCounts.map((r) => [r.trainerId, r.count]));
  const videoCountMap = new Map(videoCounts.map((r) => [r.uploaderId, r.count]));

  return rows.map((r) => ({
    ...r,
    activeTraineeCount: traineeCountMap.get(r.id) ?? 0,
    videoCount: videoCountMap.get(r.id) ?? 0,
  }));
}

export async function getTrainerById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      roles: true,
      trainerAssignments: {
        with: {
          trainee: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!user) return null;
  const hasTrainerRole = user.roles.some(
    (r) => r.role === "trainer" || r.role === "trainer_manager",
  );
  if (!hasTrainerRole) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles: user.roles.map((r) => r.role),
    trainerAssignments: user.trainerAssignments.map((ta) => ({
      assignmentId: ta.id,
      assignedAt: ta.assignedAt,
      trainee: ta.trainee,
    })),
  };
}

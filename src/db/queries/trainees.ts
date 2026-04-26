import { and, asc, count, eq, inArray, isNull, max, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  coachingSessions,
  trainerAssignments,
  userRoles,
  users,
} from "@/db/schema";

export type TraineeRow = Awaited<ReturnType<typeof listTrainees>>[number];

export type ListTraineesOptions = {
  limit: number;
  offset: number;
  trainerId?: string;
};

export async function listTrainees(options: ListTraineesOptions) {
  const traineeIdsSubquery = db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(sql`${userRoles.role} = 'trainee'`);

  const conditions = [inArray(users.id, traineeIdsSubquery)];

  if (options.trainerId) {
    const activeTraineeIds = db
      .select({ traineeId: trainerAssignments.traineeId })
      .from(trainerAssignments)
      .where(
        and(
          eq(trainerAssignments.trainerId, options.trainerId),
          isNull(trainerAssignments.endedAt),
        ),
      );
    conditions.push(inArray(users.id, activeTraineeIds));
  }

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      sessionCount: count(coachingSessions.id),
      lastSessionAt: max(coachingSessions.occurredAt),
    })
    .from(users)
    .where(and(...conditions))
    .leftJoin(coachingSessions, eq(coachingSessions.traineeId, users.id))
    .groupBy(users.id, users.email, users.name, users.createdAt, users.updatedAt)
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);

  if (rows.length === 0) return [];

  const traineeIds = rows.map((r) => r.id);

  const assignments = await db
    .select({
      traineeId: trainerAssignments.traineeId,
      trainerName: users.name,
    })
    .from(trainerAssignments)
    .innerJoin(users, eq(users.id, trainerAssignments.trainerId))
    .where(
      and(
        inArray(trainerAssignments.traineeId, traineeIds),
        isNull(trainerAssignments.endedAt),
      ),
    );

  const trainerByTrainee = new Map(assignments.map((a) => [a.traineeId, a.trainerName]));

  return rows.map((r) => ({
    ...r,
    trainerName: trainerByTrainee.get(r.id) ?? null,
  }));
}

export async function getTraineeById(id: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      roles: true,
      traineeAssignments: {
        where: (ta, { isNull }) => isNull(ta.endedAt),
        with: {
          trainer: {
            columns: { id: true, name: true, email: true },
          },
        },
      },
      coachingSessions: {
        orderBy: (cs, { desc }) => [desc(cs.occurredAt)],
        limit: 20,
        with: {
          exercises: {
            orderBy: (ex, { asc }) => [asc(ex.createdAt)],
          },
        },
      },
    },
  });

  if (!user) return null;
  if (!user.roles.some((r) => r.role === "trainee")) return null;

  const [activeAssignment] = user.traineeAssignments;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    activeTrainer: activeAssignment
      ? {
          assignmentId: activeAssignment.id,
          assignedAt: activeAssignment.assignedAt,
          trainer: activeAssignment.trainer,
        }
      : null,
    coachingSessions: user.coachingSessions,
  };
}

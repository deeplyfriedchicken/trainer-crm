import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { trainerAssignments, userRoles, users } from "@/db/schema";

export type ListTraineesOptions = {
  limit: number;
  offset: number;
  trainerId?: string;
};

export async function listTrainees(options: ListTraineesOptions) {
  const traineeIdsSubquery = db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(eq(userRoles.role, "trainee"));

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

  return db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(and(...conditions))
    .orderBy(asc(users.name))
    .limit(options.limit)
    .offset(options.offset);
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

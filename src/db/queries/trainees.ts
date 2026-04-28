import { and, asc, count, eq, inArray, isNull, max } from "drizzle-orm";
import { db } from "@/db";
import {
  trainerAssignments,
  users,
  workoutPlans,
} from "@/db/schema";

export type TraineeRow = Awaited<ReturnType<typeof listTrainees>>[number];

export type ListTraineesOptions = {
  limit: number;
  offset: number;
  trainerId?: string;
};

export async function listTrainees(options: ListTraineesOptions) {
  const whereClause = options.trainerId
    ? inArray(
        users.id,
        db
          .select({ traineeId: trainerAssignments.traineeId })
          .from(trainerAssignments)
          .where(
            and(
              eq(trainerAssignments.trainerId, options.trainerId),
              isNull(trainerAssignments.endedAt),
            ),
          ),
      )
    : undefined;

  const rows = await db
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
    .where(whereClause)
    .leftJoin(workoutPlans, eq(workoutPlans.traineeId, users.id))
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
    workoutPlans: user.workoutPlans,
    workouts: user.workouts,
  };
}
